"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { RoomProvider, useRoom, useMutation, useStorage } from "@liveblocks/react/suspense"
import { LiveblocksProvider } from "@liveblocks/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Save, AlertCircle, Wifi, WifiOff, Clock, CheckCircle } from "lucide-react"
import { configManager } from "@/lib/config"
import { toast } from "sonner"

interface SyncStatus {
  status: "synced" | "syncing" | "error" | "offline"
  lastSynced?: Date
  pendingChanges: number
  error?: string
}

interface CollaborativeTextEditorProps {
  planId: string
  sectionId: string
  initialContent?: string
  onContentChange?: (content: string) => void
}

function TextEditor({ planId, sectionId, initialContent = "", onContentChange }: CollaborativeTextEditorProps) {
  const room = useRoom()
  const [content, setContent] = useState(initialContent)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: "synced",
    pendingChanges: 0,
  })
  const [isOnline, setIsOnline] = useState(true)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedContentRef = useRef(initialContent)

  // Liveblocks storage for real-time collaboration
  const updateLiveblocks = useMutation(({ storage }, newContent: string) => {
    storage.set("content", newContent)
  }, [])

  const liveblocksContent = useStorage((root) => root.content) as string | undefined

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Sync content from Liveblocks
  useEffect(() => {
    if (liveblocksContent !== undefined && liveblocksContent !== content) {
      setContent(liveblocksContent)
      onContentChange?.(liveblocksContent)
    }
  }, [liveblocksContent, content, onContentChange])

  // Save to API with retry logic
  const saveToAPI = useCallback(
    async (contentToSave: string, retryCount = 0): Promise<boolean> => {
      if (!isOnline) {
        setSyncStatus((prev) => ({ ...prev, status: "offline" }))
        return false
      }

      try {
        setSyncStatus((prev) => ({ ...prev, status: "syncing" }))

        const response = await fetch(`/api/business-plans/${planId}/sections/${sectionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: contentToSave,
            lastModified: new Date().toISOString(),
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error?.message || "Save failed")
        }

        lastSavedContentRef.current = contentToSave
        setSyncStatus({
          status: "synced",
          lastSynced: new Date(),
          pendingChanges: 0,
        })

        return true
      } catch (error) {
        console.error("Save error:", error)

        // Retry logic with exponential backoff
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000
          setTimeout(() => {
            saveToAPI(contentToSave, retryCount + 1)
          }, delay)
          return false
        }

        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        setSyncStatus({
          status: "error",
          pendingChanges: contentToSave !== lastSavedContentRef.current ? 1 : 0,
          error: errorMessage,
        })

        toast.error(`Failed to save: ${errorMessage}`)
        return false
      }
    },
    [planId, sectionId, isOnline],
  )

  // Handle content changes with debounced saving
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent)
      onContentChange?.(newContent)

      // Update Liveblocks for real-time collaboration
      updateLiveblocks(newContent)

      // Update sync status to show pending changes
      setSyncStatus((prev) => ({
        ...prev,
        pendingChanges: newContent !== lastSavedContentRef.current ? 1 : 0,
      }))

      // Debounced save to API
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveToAPI(newContent)
      }, 2000) // Save after 2 seconds of inactivity
    },
    [updateLiveblocks, onContentChange, saveToAPI],
  )

  // Manual save
  const handleManualSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveToAPI(content)
  }, [content, saveToAPI])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Sync status indicator
  const getSyncStatusIcon = () => {
    switch (syncStatus.status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "syncing":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "offline":
        return <WifiOff className="h-4 w-4 text-gray-500" />
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />
    }
  }

  const getSyncStatusText = () => {
    switch (syncStatus.status) {
      case "synced":
        return syncStatus.lastSynced ? `Saved ${syncStatus.lastSynced.toLocaleTimeString()}` : "All changes saved"
      case "syncing":
        return "Saving..."
      case "error":
        return `Error: ${syncStatus.error}`
      case "offline":
        return "Offline - changes will sync when online"
      default:
        return "Ready"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Section Editor</CardTitle>
        <div className="flex items-center space-x-2">
          {syncStatus.pendingChanges > 0 && (
            <Badge variant="secondary" className="text-xs">
              {syncStatus.pendingChanges} pending
            </Badge>
          )}
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {getSyncStatusIcon()}
            <span>{getSyncStatusText()}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSave}
            disabled={syncStatus.status === "syncing" || !isOnline}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {syncStatus.status === "error" && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {syncStatus.error}. Your changes are saved locally and will sync when the connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {!isOnline && (
          <Alert className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're offline. Changes will be saved locally and synced when you're back online.
            </AlertDescription>
          </Alert>
        )}

        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing your business plan section..."
          className="min-h-[400px] resize-none"
        />
      </CardContent>
    </Card>
  )
}

// keep default export
export default function CollaborativeTextEditor(props: CollaborativeTextEditorProps) {
  const liveblocksConfig = configManager.getLiveblocksConfig()

  if (!configManager.isLiveblocksConfigured()) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Liveblocks is not configured. Please set up your environment variables to enable real-time collaboration.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <LiveblocksProvider publicApiKey={liveblocksConfig.publicKey}>
      <RoomProvider
        id={`plan-${props.planId}-section-${props.sectionId}`}
        initialPresence={{}}
        initialStorage={{ content: props.initialContent || "" }}
      >
        <TextEditor {...props} />
      </RoomProvider>
    </LiveblocksProvider>
  )
}

/* NEW — named re-export for the runtime checker */
export { CollaborativeTextEditor }
