import { z } from "zod"

// Validation schemas
const BusinessPlanSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sections: z.record(z.string(), z.string()),
  created_at: z.string(),
  updated_at: z.string(),
  user_id: z.string(),
  status: z.enum(["draft", "in_progress", "completed"]).default("draft"),
})

const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string().min(1, "Full name is required"),
  company: z.string().optional(),
  role: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type BusinessPlan = z.infer<typeof BusinessPlanSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>

export interface DataIntegrityResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  repaired?: boolean
}

export interface DataSource {
  name: string
  available: boolean
  lastChecked: Date
  errorCount: number
}

export class DataIntegrityManager {
  private dataSources: Map<string, DataSource> = new Map()
  private repairAttempts: Map<string, number> = new Map()
  private maxRepairAttempts = 3

  constructor() {
    this.initializeDataSources()
  }

  private initializeDataSources() {
    this.dataSources.set("airtable", {
      name: "Airtable",
      available: true,
      lastChecked: new Date(),
      errorCount: 0,
    })

    this.dataSources.set("liveblocks", {
      name: "Liveblocks",
      available: true,
      lastChecked: new Date(),
      errorCount: 0,
    })

    this.dataSources.set("supabase", {
      name: "Supabase",
      available: true,
      lastChecked: new Date(),
      errorCount: 0,
    })

    this.dataSources.set("localStorage", {
      name: "Local Storage",
      available: typeof window !== "undefined" && !!window.localStorage,
      lastChecked: new Date(),
      errorCount: 0,
    })
  }

  async validateBusinessPlan(data: any): Promise<DataIntegrityResult> {
    const result: DataIntegrityResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    try {
      // Basic validation
      const validated = BusinessPlanSchema.parse(data)

      // Additional integrity checks
      if (validated.sections) {
        const sectionKeys = Object.keys(validated.sections)
        if (sectionKeys.length === 0) {
          result.warnings.push("Business plan has no sections")
        }

        // Check for empty sections
        const emptySections = sectionKeys.filter((key) => !validated.sections[key]?.trim())
        if (emptySections.length > 0) {
          result.warnings.push(`Empty sections found: ${emptySections.join(", ")}`)
        }
      }

      // Check timestamps
      const createdAt = new Date(validated.created_at)
      const updatedAt = new Date(validated.updated_at)

      if (updatedAt < createdAt) {
        result.errors.push("Updated timestamp is before created timestamp")
        result.isValid = false
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.errors = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`)
      } else {
        result.errors.push("Unknown validation error")
      }
      result.isValid = false
    }

    return result
  }

  async validateUserProfile(data: any): Promise<DataIntegrityResult> {
    const result: DataIntegrityResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    try {
      const validated = UserProfileSchema.parse(data)

      // Additional checks
      if (!validated.company && !validated.role) {
        result.warnings.push("User profile missing company and role information")
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.errors = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`)
      } else {
        result.errors.push("Unknown validation error")
      }
      result.isValid = false
    }

    return result
  }

  async repairBusinessPlan(data: any): Promise<{ repaired: any; success: boolean }> {
    const repairKey = `business_plan_${data.id || "unknown"}`
    const attempts = this.repairAttempts.get(repairKey) || 0

    if (attempts >= this.maxRepairAttempts) {
      return { repaired: data, success: false }
    }

    this.repairAttempts.set(repairKey, attempts + 1)

    const repaired = { ...data }

    // Repair missing required fields
    if (!repaired.id) {
      repaired.id = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    if (!repaired.title) {
      repaired.title = "Untitled Business Plan"
    }

    if (!repaired.sections) {
      repaired.sections = {}
    }

    if (!repaired.status) {
      repaired.status = "draft"
    }

    const now = new Date().toISOString()
    if (!repaired.created_at) {
      repaired.created_at = now
    }

    if (!repaired.updated_at) {
      repaired.updated_at = now
    }

    // Fix timestamp order
    if (new Date(repaired.updated_at) < new Date(repaired.created_at)) {
      repaired.updated_at = repaired.created_at
    }

    return { repaired, success: true }
  }

  async repairUserProfile(data: any): Promise<{ repaired: any; success: boolean }> {
    const repairKey = `user_profile_${data.id || "unknown"}`
    const attempts = this.repairAttempts.get(repairKey) || 0

    if (attempts >= this.maxRepairAttempts) {
      return { repaired: data, success: false }
    }

    this.repairAttempts.set(repairKey, attempts + 1)

    const repaired = { ...data }

    // Repair missing required fields
    if (!repaired.id) {
      repaired.id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    if (!repaired.full_name) {
      repaired.full_name = "Unknown User"
    }

    if (!repaired.email) {
      repaired.email = `user${Date.now()}@example.com`
    }

    const now = new Date().toISOString()
    if (!repaired.created_at) {
      repaired.created_at = now
    }

    if (!repaired.updated_at) {
      repaired.updated_at = now
    }

    return { repaired, success: true }
  }

  updateDataSourceStatus(sourceName: string, available: boolean, error?: Error) {
    const source = this.dataSources.get(sourceName)
    if (source) {
      source.available = available
      source.lastChecked = new Date()
      if (error) {
        source.errorCount++
      } else {
        source.errorCount = 0
      }
    }
  }

  getDataSourceStatus(): DataSource[] {
    return Array.from(this.dataSources.values())
  }

  getAvailableDataSources(): string[] {
    return Array.from(this.dataSources.entries())
      .filter(([_, source]) => source.available)
      .map(([name]) => name)
  }

  async performHealthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = []
    const sources = this.getDataSourceStatus()

    sources.forEach((source) => {
      if (!source.available) {
        issues.push(`${source.name} is unavailable`)
      }
      if (source.errorCount > 5) {
        issues.push(`${source.name} has high error count: ${source.errorCount}`)
      }
    })

    return {
      healthy: issues.length === 0,
      issues,
    }
  }
}

export const dataIntegrityManager = new DataIntegrityManager()
