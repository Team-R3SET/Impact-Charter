"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import {
  useMutation,
  useStorage,
  useMyPresence,
  useOthers,
  useBroadcastEvent,
  useEventListener,
} from "@/lib/liveblocks"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Circle, Users, Edit3, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CollaborativeTextEditorProps {
  sectionId: string
  placeholder: string
  planId: string
  userEmail: string
}

export function CollaborativeTextEditor({ sectionId, placeholder, planId, userEmail }: CollaborativeTextEditorProps) {
  const [localContent, setLocalContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  const [myPresence, updateMyPresence] = useMyPresence()
  const others = useOthers()
  const broadcast = useBroadcastEvent()

  const sectionContent = useStorage((root) => root.sections?.[sectionId]?.content ?? "") as string

  // Get users currently in this section
  const usersInSection = others.filter(
    (user) => user.presence.selectedSection === sectionId || user.presence.isTyping?.sectionId === sectionId,
  )

  // Get users currently typing in this section
  const typingUsers = others.filter((user) => {
    const typing = user.presence.isTyping
    return typing && typing.sectionId === sectionId && Date.now() - typing.timestamp < 3000
  })

  // Liveblocks storage is `undefined` until it finishes loading
  const storageReady = useStorage((root) => (root === undefined ? false : true)) as boolean

  const updateSection = useMutation(
    ({ storage }, content: string) => {
      const sections = storage.get("sections") || {}
      sections[sectionId] = {
        title: sectionId,
        content,
        lastModified: new Date().toISOString(),
        modifiedBy: userEmail,
      }
      storage.set("sections", sections)
    },
    [sectionId, userEmail],
  )

  const toggleCompletion = useMutation(({ storage }, sectionId: string, isCompleted: boolean) => {
    const completedSections = storage.get("completedSections") || {}
    completedSections[sectionId] = isCompleted
    storage.set("completedSections", completedSections)
  }, [])

  const isCompleted = useStorage((root) => root.completedSections?.[sectionId] ?? false) as boolean

  // Update presence when section changes
  useEffect(() => {
    updateMyPresence({
      selectedSection: sectionId,
      textCursor: null,
      textSelection: null,
      isTyping: null,
    })

    return () => {
      updateMyPresence({
        selectedSection: null,
        textCursor: null,
        textSelection: null,
        isTyping: null,
      })
    }
  }, [sectionId, updateMyPresence])

  // Sync with LiveBlocks storage
  useEffect(() => {
    const safeContent = sectionContent ?? ""
    if (safeContent !== localContent && !isComposing) {
      setLocalContent(safeContent)
    }
  }, [sectionContent, localContent, isComposing])

  // Listen for real-time text changes from other users
  useEventListener(({ event }) => {
    if (event.type === "TEXT_CHANGE" && event.sectionId === sectionId) {
      if (!isComposing) {
        setLocalContent(event.content)
      }
    }
  })

  // Auto-save to Airtable
  const saveToAirtable = async (content: string) => {
    setIsSaving(true)
    setSaveError(null)

    try {
      const response = await fetch(`/api/business-plans/${planId}/sections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionName: sectionId,
          sectionContent: content,
          modifiedBy: userEmail,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setSaveError(result.message || "Failed to save to Airtable")
      }
    } catch (error) {
      console.error("Failed to save to Airtable:", error)
      setSaveError("Failed to save changes. Content saved locally.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleContentChange = useCallback(
    (content: string) => {
      if (!storageReady) return // wait until Liveblocks storage has loaded

      setLocalContent(content)
      updateSection(content)

      // Broadcast real-time change
      broadcast({
        type: "TEXT_CHANGE",
        sectionId,
        content,
        userId: userEmail,
      })

      // Update typing presence
      updateMyPresence({
        isTyping: {
          sectionId,
          timestamp: Date.now(),
        },
      })

      // Clear typing indicator after 2 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        updateMyPresence({
          isTyping: null,
        })
      }, 2000)

      // Debounced save to Airtable
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveToAirtable(content)
      }, 2000)
    },
    [updateSection, broadcast, sectionId, userEmail, updateMyPresence, storageReady],
  )

  const handleCursorChange = useCallback(() => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    if (start === end) {
      // Just cursor position
      updateMyPresence({
        textCursor: { sectionId, position: start },
        textSelection: null,
      })
    } else {
      // Text selection
      updateMyPresence({
        textCursor: null,
        textSelection: { sectionId, start, end },
      })
    }
  }, [sectionId, updateMyPresence])

  const handleMarkComplete = async () => {
    if (!storageReady) return

    try {
      const response = await fetch(`/api/business-plans/${planId}/sections/${sectionId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Section Completed",
          description: result.message,
        })
        toggleCompletion(sectionId, true)
      } else {
        toast({
          title: "Marked Complete Locally",
          description: result.message,
          variant: "destructive",
        })
        toggleCompletion(sectionId, true)
      }
    } catch (error) {
      toast({
        title: "Marked Complete Locally",
        description: "Section marked as complete locally. Check your Airtable connection.",
        variant: "destructive",
      })
      toggleCompletion(sectionId, true)
    }
  }

  return (
    <div className="space-y-4">
      {/* Save error alert */}
      {saveError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {saveError} Your changes are saved locally and will sync when connection is restored.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={isCompleted ? "default" : "outline"}
            size="sm"
            onClick={handleMarkComplete}
            className="gap-2"
          >
            {isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Completed
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                Mark as Complete
              </>
            )}
          </Button>
          {isCompleted && (
            <Badge variant="secondary" className="text-xs">
              Section completed
            </Badge>
          )}
        </div>

        {/* Users in section indicator */}
        {usersInSection.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {usersInSection.slice(0, 3).map((user) => (
                <Avatar key={user.connectionId} className="w-6 h-6 border-2 border-background">
                  <AvatarImage src={user.presence.user?.avatar || "/placeholder.svg"} alt={user.presence.user?.name} />
                  <AvatarFallback className="text-xs">
                    {user.presence.user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Badge variant="outline" className="text-xs gap-1">
              <Users className="w-3 h-3" />
              {usersInSection.length} editing
            </Badge>
          </div>
        )}
      </div>

      {/* Typing indicators */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Edit3 className="w-4 h-4 animate-pulse" />
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0].presence.user?.name} is typing...`
              : `${typingUsers.length} people are typing...`}
          </span>
        </div>
      )}

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={localContent ?? ""}
          onChange={(e) => handleContentChange(e.target.value)}
          onSelect={handleCursorChange}
          onKeyUp={handleCursorChange}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={placeholder}
          className="min-h-[300px] resize-none"
        />

        {/* Save indicator */}
        {isSaving && (
          <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Saving...
          </div>
        )}

        {/* Live collaboration indicator */}
        {usersInSection.length > 0 && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
        )}
      </div>
    </div>
  )
}
