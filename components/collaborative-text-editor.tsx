"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, Clock, Users, Save, AlertCircle, Wifi, WifiOff, ChevronLeft, ChevronRight, Maximize, Minimize, Bold, Italic, Underline, X } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { businessPlanSections, getNextSection, getPreviousSection, getSectionIndex } from "@/lib/business-plan-sections"
import { logAccess, logError } from "@/lib/logging"
import type { User } from "@/lib/user-types"

// Conditional Liveblocks imports with error handling
let useMyPresence: any = null
let useOthers: any = null
let useMutation: any = null
let useStorage: any = null
let useBroadcastEvent: any = null
let useEventListener: any = null
let useRoom: any = null

try {
  const liveblocks = require("@/lib/liveblocks")
  useMyPresence = liveblocks.useMyPresence
  useOthers = liveblocks.useOthers
  useMutation = liveblocks.useMutation
  useStorage = liveblocks.useStorage
  useBroadcastEvent = liveblocks.useBroadcastEvent
  useEventListener = liveblocks.useEventListener
  useRoom = liveblocks.useRoom
} catch (error) {
  console.warn("Liveblocks not available, running in standalone mode")
}

interface CollaborativeTextEditorProps {
  sectionId: string
  sectionTitle: string
  planId: string
  currentUser: {
    name: string
    email: string
    avatar?: string
  }
  onSectionComplete?: (sectionId: string, isComplete: boolean) => void
  onSectionSelect?: (sectionId: string) => void
  isFullScreen?: boolean
  onToggleFullScreen?: () => void
}

export function CollaborativeTextEditor({
  sectionId,
  sectionTitle,
  planId,
  currentUser,
  onSectionComplete,
  onSectionSelect,
  isFullScreen = false,
  onToggleFullScreen,
}: CollaborativeTextEditorProps) {
  const room = useRoom?.() || null
  const [localContent, setLocalContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isCollaborative, setIsCollaborative] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [currentSectionData, setCurrentSectionData] = useState<{ title: string, description: string }>({ title: "", description: "" })

  const [myPresence, updateMyPresence] = useMyPresence ? useMyPresence() : [null, () => {}]
  const others = useOthers ? useOthers() : []
  const sections = useStorage ? useStorage((root) => root?.sections) : null
  const completedSections = useStorage ? useStorage((root) => root?.completedSections) : null
  const broadcast = useBroadcastEvent ? useBroadcastEvent() : () => {}
  const updateSection = useMutation
    ? useMutation(
        ({ storage }, content: string) => {
          if (!storage.get("sections")) {
            storage.set("sections", new Map())
          }
          if (!storage.get("completedSections")) {
            storage.set("completedSections", new Map())
          }

          const sectionsMap = storage.get("sections")
          sectionsMap.set(sectionId, {
            title: sectionTitle,
            content,
            lastModified: new Date().toISOString(),
            modifiedBy: currentUser.email,
            isCompleted: false,
          })
        },
        [sectionId, sectionTitle, currentUser.email],
      )
    : null
  const markSectionComplete = useMutation
    ? useMutation(
        ({ storage }) => {
          if (!storage.get("completedSections")) {
            storage.set("completedSections", new Map())
          }

          const completedMap = storage.get("completedSections")
          completedMap.set(sectionId, true)

          const sectionsMap = storage.get("sections")
          if (sectionsMap && sectionsMap.get(sectionId)) {
            const section = sectionsMap.get(sectionId)
            sectionsMap.set(sectionId, {
              ...section,
              isCompleted: true,
              lastModified: new Date().toISOString(),
              modifiedBy: currentUser.email,
            })
          }
        },
        [sectionId, currentUser.email],
      )
    : null
  const markSectionIncomplete = useMutation
    ? useMutation(
        ({ storage }) => {
          const completedMap = storage.get("completedSections")
          if (completedMap) {
            completedMap.delete(sectionId)
          }

          const sectionsMap = storage.get("sections")
          if (sectionsMap && sectionsMap.get(sectionId)) {
            const section = sectionsMap.get(sectionId)
            sectionsMap.set(sectionId, {
              ...section,
              isCompleted: false,
              lastModified: new Date().toISOString(),
              modifiedBy: currentUser.email,
            })
          }
        },
        [sectionId, currentUser.email],
      )
    : null

  // Get collaborative users
  const usersTyping = isCollaborative
    ? others.filter(
        (user: any) =>
          user.presence?.isTyping?.sectionId === sectionId && Date.now() - user.presence.isTyping.timestamp < 3000,
      ) || []
    : []

  const usersInSection = isCollaborative
    ? others.filter((user: any) => user.presence?.selectedSection === sectionId) || []
    : []

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Set collaborative mode
  useEffect(() => {
    setIsCollaborative(!!room)
  }, [room])

  // Update presence when in collaborative mode
  useEffect(() => {
    if (!room) return

    updateMyPresence({
      selectedSection: sectionId,
      user: {
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar || "/placeholder.svg",
      },
    })

    return () => {
      updateMyPresence({ selectedSection: null })
    }
  }, [sectionId, currentUser, room, updateMyPresence])

  // Save to Airtable with better error handling
  const saveToAirtable = useCallback(
    async (content: string) => {
      if (!isOnline) {
        setSaveError("You're offline. Changes will be saved locally.")
        return
      }

      try {
        setIsSaving(true)
        setSaveError(null)

        // Log the access attempt
        await logAccess(
          currentUser as User,
          "SAVE_SECTION",
          `plan/${planId}/section/${sectionId}`,
          true,
          `Content length: ${content.length}`,
        )

        console.log(`[saveToAirtable] Saving section ${sectionId} for plan ${planId}`)

        const response = await fetch(`/api/business-plans/${planId}/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionName: sectionId,
            sectionContent: content,
            userEmail: currentUser.email,
          }),
        })

        /* ---------- read and interpret the server reply ---------- */
        let result: any = null
        const rawBody = await response.text()

        // Try to parse JSON first – fall back to raw text/HTML
        try {
          result = JSON.parse(rawBody)
        } catch {
          result = { raw: rawBody }
        }

        // Non-2xx status = API error
        if (!response.ok) {
          await logError(
            result?.error || rawBody || `HTTP ${response.status}`,
            "API_ERROR",
            response.status >= 500 ? "HIGH" : "MEDIUM",
            window.location.href,
            currentUser as User,
            undefined,
            undefined,
            { planId, sectionId, statusCode: response.status },
          )
          throw new Error(result?.error || `Server error: ${response.status}`)
        }

        // If the body *looked* like JSON but didn’t have success=true, treat that as an error too
        if (!result?.success) {
          throw new Error(result?.error || "Unexpected server reply")
        }

        if (result.success) {
          setLastSaved(new Date())
          setSaveError(null)
          toast({
            title: "Section saved",
            description: "Your changes have been saved successfully.",
          })
        } else {
          throw new Error(result.error || "Unknown error occurred")
        }
      } catch (error) {
        console.error("Failed to save to Airtable:", error)

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        setSaveError(errorMessage)

        // Log the error with context
        await logError(
          errorMessage,
          "API_ERROR",
          "MEDIUM",
          window.location.href,
          currentUser as User,
          undefined,
          error instanceof Error ? error.stack : undefined,
          { planId, sectionId, action: "save_section" },
        )

        // Show different messages based on error type
        if (errorMessage.includes("table not found")) {
          toast({
            title: "Airtable Setup Required",
            description: "Please create the Business Plan Sections table in your Airtable base or check your settings.",
            variant: "destructive",
          })
        } else if (errorMessage.includes("API key") || errorMessage.includes("401")) {
          toast({
            title: "Authentication Error",
            description: "Please check your Airtable API key in Settings.",
            variant: "destructive",
          })
        } else if (errorMessage.includes("Permission denied") || errorMessage.includes("403")) {
          toast({
            title: "Permission Error",
            description: "Your API key doesn't have permission to modify this base.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Save failed",
            description: "Working in local mode. Check your connection and Airtable settings.",
            variant: "destructive",
          })
        }
      } finally {
        setIsSaving(false)
      }
    },
    [planId, sectionId, currentUser, toast, isOnline],
  )

  // Handle content changes
  const handleContentChange = useCallback(
    (content: string) => {
      setLocalContent(content)

      // Always save to localStorage as backup
      localStorage.setItem(`section-${planId}-${sectionId}`, content)

      // Update collaborative storage if available
      if (updateSection) {
        updateSection(content)
      }

      // Broadcast changes if collaborative
      if (broadcast) {
        broadcast({
          type: "TEXT_CHANGE",
          sectionId,
          content,
          userId: currentUser.email,
        })
      }

      // Update typing presence
      if (room) {
        updateMyPresence({
          isTyping: { sectionId, timestamp: Date.now() },
        })
      }

      // Debounced save to Airtable
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveToAirtable(content)
      }, 2000)
    },
    [planId, sectionId, updateSection, broadcast, room, updateMyPresence, saveToAirtable],
  )

  // Handle mark as complete
  const handleMarkComplete = async () => {
    try {
      setIsCompleting(true)
      setSaveError(null)

      // Log the completion attempt
      await logAccess(
        currentUser as User,
        "COMPLETE_SECTION",
        `plan/${planId}/section/${sectionId}`,
        true,
        "Section marked as complete",
      )

      // Update local state
      setIsCompleted(true)
      localStorage.setItem(`section-${planId}-${sectionId}-completed`, JSON.stringify(true))

      // Notify parent component
      onSectionComplete?.(sectionId, true)

      // Update collaborative storage
      if (markSectionComplete) {
        markSectionComplete()
      }

      // Save to Airtable
      const response = await fetch(`/api/business-plans/${planId}/sections/${sectionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: currentUser.email,
        }),
      })

      if (response.ok) {
        // Broadcast completion
        if (broadcast) {
          broadcast({
            type: "SECTION_COMPLETED",
            sectionId,
            userId: currentUser.email,
          })
        }

        toast({
          title: "Section completed!",
          description: `${sectionTitle} has been marked as complete and submitted for review.`,
        })
      } else {
        // Handle API error with detailed information
        const errorData = await response.json().catch(() => ({ error: "Unknown error", errorDetails: null }))
        console.warn("Failed to save completion to Airtable:", errorData)

        // Log the error
        await logError(
          `Failed to save section completion: ${errorData.error}`,
          "API_ERROR",
          "MEDIUM",
          window.location.href,
          currentUser as User,
          undefined,
          undefined,
          { planId, sectionId, action: "complete_section", errorDetails: errorData.errorDetails },
        )

        // Show detailed error message with troubleshooting link
        const errorId = errorData.errorDetails?.errorId || 'unknown'
        toast({
          title: "Section completion failed",
          description: (
            <div className="space-y-2">
              <p>{errorData.error || "Failed to save completion to server"}</p>
              <p className="text-sm text-muted-foreground">
                <a 
                  href={`/error-log/${errorId}?planId=${planId}&sectionId=${sectionId}`}
                  className="text-blue-500 hover:text-blue-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View troubleshooting guide →
                </a>
              </p>
            </div>
          ),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to mark as complete:", error)

      // Log the error
      await logError(
        error instanceof Error ? error.message : "Unknown error during section completion",
        "SYSTEM_ERROR",
        "MEDIUM",
        window.location.href,
        currentUser as User,
        undefined,
        error instanceof Error ? error.stack : undefined,
        { planId, sectionId, action: "complete_section" },
      )

      // Enhanced error message with troubleshooting link
      const errorId = `client-error-${Date.now()}`
      toast({
        title: "Section completion failed",
        description: (
          <div className="space-y-2">
            <p>An unexpected error occurred while completing the section.</p>
            <p className="text-sm text-muted-foreground">
              <a 
                href={`/error-log/${errorId}?planId=${planId}&sectionId=${sectionId}&error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`}
                className="text-blue-500 hover:text-blue-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View troubleshooting guide →
              </a>
            </p>
          </div>
        ),
        variant: "destructive",
      })
    } finally {
      setIsCompleting(false)
    }
  }

  // Handle mark as incomplete
  const handleMarkIncomplete = async () => {
    try {
      setIsCompleting(true)
      setSaveError(null)

      // Log the incomplete action
      await logAccess(
        currentUser as User,
        "MARK_INCOMPLETE",
        `plan/${planId}/section/${sectionId}`,
        true,
        "Section marked as incomplete",
      )

      // Update local state
      setIsCompleted(false)
      localStorage.setItem(`section-${planId}-${sectionId}-completed`, JSON.stringify(false))

      // Notify parent component
      onSectionComplete?.(sectionId, false)

      // Update collaborative storage
      if (markSectionIncomplete) {
        markSectionIncomplete()
      }

      // Save to Airtable
      const response = await fetch(`/api/business-plans/${planId}/sections/${sectionId}/incomplete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedBy: currentUser.email,
        }),
      })

      if (response.ok) {
        // Broadcast incomplete status
        if (broadcast) {
          broadcast({
            type: "SECTION_MARKED_INCOMPLETE",
            sectionId,
            userId: currentUser.email,
          })
        }

        toast({
          title: "Section marked incomplete",
          description: `${sectionTitle} has been marked as incomplete.`,
        })
      } else {
        // Handle API error
        const errorData = await response.json().catch(() => ({ error: "Unknown error", errorDetails: null }))
        console.warn("Failed to save incomplete status to Airtable:", errorData)

        toast({
          title: "Failed to mark incomplete",
          description: errorData.error || "Failed to update status on server",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to mark as incomplete:", error)
      toast({
        title: "Error",
        description: "Failed to mark section as incomplete. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCompleting(false)
    }
  }

  // Load initial content and completion state
  useEffect(() => {
    // Load from collaborative storage first
    if (sections && sections[sectionId]) {
      setLocalContent(sections[sectionId].content || "")
      setIsCompleted(sections[sectionId].isCompleted || false)
    } else {
      // Fallback to localStorage
      const savedContent = localStorage.getItem(`section-${planId}-${sectionId}`)
      const savedCompletion = localStorage.getItem(`section-${planId}-${sectionId}-completed`)

      if (savedContent) {
        setLocalContent(savedContent)
      }
      if (savedCompletion) {
        const completed = JSON.parse(savedCompletion)
        setIsCompleted(completed)
        // Notify parent of initial completion state
        onSectionComplete?.(sectionId, completed)
      }
    }
    setIsLoading(false)
  }, [sections, sectionId, planId, onSectionComplete])

  // Determine final completion state
  const currentSection = sections?.[sectionId]
  const completedFromStorage = completedSections?.[sectionId] || currentSection?.isCompleted || false
  const finalIsCompleted = isCollaborative ? completedFromStorage : isCompleted

  // Get navigation sections
  const prevSection = getPreviousSection(sectionId)
  const nextSection = getNextSection(sectionId)
  const currentIndex = getSectionIndex(sectionId)

  const applyFormatting = useCallback((format: 'bold' | 'italic' | 'underline') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = localContent.substring(start, end)
    
    let formattedText = ''
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'underline':
        formattedText = `<u>${selectedText}</u>`
        break
    }

    const newContent = localContent.substring(0, start) + formattedText + localContent.substring(end)
    handleContentChange(newContent)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
    }, 0)
  }, [localContent, handleContentChange])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading section...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={isFullScreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col" : ""}>
      <Card className={isFullScreen ? "flex-1 rounded-none border-0" : ""}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">{sectionTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{currentSectionData?.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onToggleFullScreen && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onToggleFullScreen}
                        className="h-8 w-8 p-0"
                      >
                        {isFullScreen ? (
                          <Minimize className="h-4 w-4" />
                        ) : (
                          <Maximize className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isFullScreen ? "Exit full screen" : "Enter full screen"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {isCollaborative && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Local
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyFormatting('bold')}
                      className="h-8 w-8 p-0"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyFormatting('italic')}
                      className="h-8 w-8 p-0"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyFormatting('underline')}
                      className="h-8 w-8 p-0"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Underline</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSaving && (
                <div className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                  <span>Saving...</span>
                </div>
              )}
              {lastSaved && !isSaving && (
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              )}
              {!isOnline && (
                <div className="flex items-center gap-1 text-orange-600">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </div>
              )}
            </div>
          </div>

          {/* Typing indicators */}
          {isCollaborative && usersTyping.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex -space-x-1">
                {usersTyping.map((user: any) => (
                  <Avatar key={user.id} className="w-4 h-4">
                    <AvatarImage src={user.presence?.user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {user.presence?.user?.name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span>
                {usersTyping.map((u: any) => u.presence?.user?.name || "Someone").join(", ")}
                {usersTyping.length === 1 ? " is" : " are"} typing...
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className={isFullScreen ? "flex-1 flex flex-col" : ""}>
          <div className={isFullScreen ? "flex-1 flex flex-col" : ""}>
            <Textarea
              ref={textareaRef}
              placeholder={`Enter your ${sectionTitle.toLowerCase()} here...`}
              value={localContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className={`min-h-[400px] resize-none border-0 shadow-none focus-visible:ring-0 text-base leading-relaxed ${
                isFullScreen ? "flex-1 min-h-0" : ""
              }`}
              disabled={finalIsCompleted}
            />
          </div>

          {!finalIsCompleted && (
            <>
              <Separator />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Complete this section when you're ready to submit it for review.
                </p>
                <Button
                  onClick={handleMarkComplete}
                  disabled={isCompleting || !localContent.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isCompleting ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                      Marking Complete...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {finalIsCompleted && currentSection && (
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ This section was completed{currentSection?.lastModified ? ` on ${new Date(currentSection.lastModified).toLocaleDateString()}` : ''}
                  {currentSection?.modifiedBy ? ` by ${currentSection.modifiedBy}` : ''}
                </p>
                <Button
                  onClick={handleMarkIncomplete}
                  disabled={isCompleting}
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-700 hover:bg-green-100 dark:border-green-400 dark:text-green-300 dark:hover:bg-green-900"
                >
                  {isCompleting ? (
                    <>
                      <X className="w-3 h-3 mr-1 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 mr-1" />
                      Mark Incomplete
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Section Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <Button
              variant="ghost"
              size="sm"
              disabled={!prevSection}
              onClick={() => prevSection && onSectionSelect?.(prevSection.id)}
              className="gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
              {prevSection && <span className="hidden sm:inline ml-1">({prevSection.title})</span>}
            </Button>

            <span className="text-xs text-muted-foreground">
              Section {currentIndex + 1} of {businessPlanSections.length}
            </span>

            <Button
              variant="ghost"
              size="sm"
              disabled={!nextSection}
              onClick={() => nextSection && onSectionSelect?.(nextSection.id)}
              className="gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {nextSection && <span className="hidden sm:inline mr-1">({nextSection.title})</span>}
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
