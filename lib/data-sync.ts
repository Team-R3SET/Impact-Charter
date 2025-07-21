import { airtableService } from "./airtable"
import { createClient } from "@liveblocks/client"
import { dataIntegrityManager } from "./data-integrity"

export interface SyncOperation {
  id: string
  type: "create" | "update" | "delete"
  resource: "business_plan" | "section" | "user_profile"
  data: any
  timestamp: number
  retryCount: number
  status: "pending" | "syncing" | "completed" | "failed"
}

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  pendingOperations: number
  lastSyncTime?: Date
  errors: string[]
}

class DataSyncManager {
  private liveblocks: any
  private syncQueue: SyncOperation[] = []
  private isProcessing = false
  private syncStatus: SyncStatus = {
    isOnline: navigator?.onLine ?? true,
    isSyncing: false,
    pendingOperations: 0,
    errors: [],
  }
  private listeners: ((status: SyncStatus) => void)[] = []
  private maxRetries = 3
  private retryDelay = 1000

  constructor() {
    this.initializeLiveblocks()
    this.setupNetworkListeners()
    this.startSyncProcessor()
  }

  private initializeLiveblocks() {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
      this.liveblocks = createClient({
        publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY,
        authEndpoint: "/api/liveblocks-auth",
      })
    }
  }

  private setupNetworkListeners() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.syncStatus.isOnline = true
        this.notifyListeners()
        this.processSyncQueue()
      })

      window.addEventListener("offline", () => {
        this.syncStatus.isOnline = false
        this.notifyListeners()
      })
    }
  }

  private startSyncProcessor() {
    setInterval(() => {
      if (this.syncStatus.isOnline && !this.isProcessing && this.syncQueue.length > 0) {
        this.processSyncQueue()
      }
    }, 5000) // Process queue every 5 seconds
  }

  private async processSyncQueue() {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return
    }

    this.isProcessing = true
    this.syncStatus.isSyncing = true
    this.notifyListeners()

    const operation = this.syncQueue[0]

    try {
      await this.executeOperation(operation)

      // Remove completed operation
      this.syncQueue.shift()
      operation.status = "completed"

      this.syncStatus.lastSyncTime = new Date()
      this.syncStatus.errors = this.syncStatus.errors.filter((error) => !error.includes(operation.id))
    } catch (error) {
      operation.retryCount++
      operation.status = "failed"

      const errorMessage = `Operation ${operation.id} failed: ${error instanceof Error ? error.message : "Unknown error"}`

      if (operation.retryCount >= this.maxRetries) {
        // Remove failed operation after max retries
        this.syncQueue.shift()
        this.syncStatus.errors.push(errorMessage)
      } else {
        // Retry with exponential backoff
        operation.status = "pending"
        setTimeout(() => {
          // Move to end of queue for retry
          const retryOp = this.syncQueue.shift()
          if (retryOp) {
            this.syncQueue.push(retryOp)
          }
        }, this.retryDelay * Math.pow(2, operation.retryCount))
      }
    }

    this.syncStatus.pendingOperations = this.syncQueue.length
    this.syncStatus.isSyncing = false
    this.isProcessing = false
    this.notifyListeners()

    // Continue processing if there are more operations
    if (this.syncQueue.length > 0 && this.syncStatus.isOnline) {
      setTimeout(() => this.processSyncQueue(), 100)
    }
  }

  private async executeOperation(operation: SyncOperation): Promise<void> {
    operation.status = "syncing"

    switch (operation.resource) {
      case "business_plan":
        await this.syncBusinessPlan(operation)
        break
      case "section":
        await this.syncSection(operation)
        break
      case "user_profile":
        await this.syncUserProfile(operation)
        break
      default:
        throw new Error(`Unknown resource type: ${operation.resource}`)
    }
  }

  private async syncBusinessPlan(operation: SyncOperation): Promise<void> {
    const { type, data } = operation

    // Validate data before syncing
    const validation = await dataIntegrityManager.validateBusinessPlan(data)
    if (!validation.isValid) {
      const repair = await dataIntegrityManager.repairBusinessPlan(data)
      if (!repair.success) {
        throw new Error(`Data validation failed: ${validation.errors.join(", ")}`)
      }
      operation.data = repair.repaired
    }

    // Sync to Airtable
    switch (type) {
      case "create":
        await airtableService.createBusinessPlan(operation.data)
        break
      case "update":
        await airtableService.updateBusinessPlan(operation.data.id, operation.data)
        break
      case "delete":
        await airtableService.deleteBusinessPlan(operation.data.id)
        break
    }

    // Sync to Liveblocks if available
    if (this.liveblocks) {
      try {
        const room = this.liveblocks.enterRoom(`plan_${operation.data.id}`)
        const storage = await room.getStorage()

        if (type === "delete") {
          await storage.root.delete("businessPlan")
        } else {
          await storage.root.set("businessPlan", operation.data)
        }

        room.leave()
      } catch (error) {
        console.warn("Failed to sync to Liveblocks:", error)
        // Don't fail the entire operation if Liveblocks sync fails
      }
    }
  }

  private async syncSection(operation: SyncOperation): Promise<void> {
    const { type, data } = operation
    const { planId, sectionId, content } = data

    // Get current plan
    const currentPlan = await airtableService.getBusinessPlan(planId)
    if (!currentPlan) {
      throw new Error(`Business plan ${planId} not found`)
    }

    // Update section
    const updatedSections = { ...currentPlan.sections }

    if (type === "delete") {
      delete updatedSections[sectionId]
    } else {
      updatedSections[sectionId] = content
    }

    // Update in Airtable
    await airtableService.updateBusinessPlan(planId, {
      sections: updatedSections,
    })

    // Sync to Liveblocks
    if (this.liveblocks) {
      try {
        const room = this.liveblocks.enterRoom(`plan_${planId}`)
        const storage = await room.getStorage()

        const businessPlan = await storage.root.get("businessPlan")
        if (businessPlan) {
          businessPlan.sections = updatedSections
          await storage.root.set("businessPlan", businessPlan)
        }

        room.leave()
      } catch (error) {
        console.warn("Failed to sync section to Liveblocks:", error)
      }
    }
  }

  private async syncUserProfile(operation: SyncOperation): Promise<void> {
    const { type, data } = operation

    // Validate data
    const validation = await dataIntegrityManager.validateUserProfile(data)
    if (!validation.isValid) {
      const repair = await dataIntegrityManager.repairUserProfile(data)
      if (!repair.success) {
        throw new Error(`Data validation failed: ${validation.errors.join(", ")}`)
      }
      operation.data = repair.repaired
    }

    // Sync to Airtable
    if (type === "update") {
      await airtableService.updateUserProfile(operation.data.id, operation.data)
    }
  }

  // Public API
  queueOperation(operation: Omit<SyncOperation, "id" | "timestamp" | "retryCount" | "status">): string {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const syncOperation: SyncOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retryCount: 0,
      status: "pending",
    }

    this.syncQueue.push(syncOperation)
    this.syncStatus.pendingOperations = this.syncQueue.length
    this.notifyListeners()

    // Start processing if online
    if (this.syncStatus.isOnline && !this.isProcessing) {
      setTimeout(() => this.processSyncQueue(), 100)
    }

    return id
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus }
  }

  onStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener)

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.syncStatus))
  }

  async forcSync(): Promise<void> {
    if (this.syncStatus.isOnline && this.syncQueue.length > 0) {
      await this.processSyncQueue()
    }
  }

  clearErrors(): void {
    this.syncStatus.errors = []
    this.notifyListeners()
  }

  retryFailedOperations(): void {
    this.syncQueue.forEach((operation) => {
      if (operation.status === "failed") {
        operation.status = "pending"
        operation.retryCount = 0
      }
    })

    if (this.syncStatus.isOnline) {
      this.processSyncQueue()
    }
  }
}

export const dataSyncManager = new DataSyncManager()
