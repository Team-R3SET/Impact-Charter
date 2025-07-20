"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, Clock, Users, Save, AlertCircle, Wifi, WifiOff, ChevronLeft, ChevronRight } from "lucide-react"
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
}

export function CollaborativeTextEditor({
  sectionId,
  sectionTitle,
  planId,
  currentUser,
  onSectionComplete,
  onSectionSelect,
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

        // Check if response is JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text()
          console.error("[saveToAirtable] Non-JSON response:", textResponse)

          // Log the error
          await logError(
            "Server returned non-JSON response",
            "API_ERROR",
            "HIGH",
            window.location.href,
            currentUser as User,
            undefined,
            undefined,
            { planId, sectionId, response: textResponse },
          )

          throw new Error("Server returned an invalid response. Please try again.")
        }

        const result = await response.json()

        if (!response.ok) {
          // Log API error
          await logError(
            result.error || `Server error: ${response.status}`,
            "API_ERROR",
            response.status >= 500 ? "HIGH" : "MEDIUM",
            window.location.href,
            currentUser as User,
            undefined,
            undefined,
            { planId, sectionId, statusCode: response.status },
          )

          throw new Error(result.error || `Server error: ${response.status}`)
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
        // Handle API error but don't revert local state
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.warn("Failed to save completion to Airtable:", errorData.error)

        // Log the error
        await logError(
          `Failed to save section completion: ${errorData.error}`,
          "API_ERROR",
          "MEDIUM",
          window.location.href,
          currentUser as User,
          undefined,
          undefined,
          { planId, sectionId, action: "complete_section" },
        )

        toast({
          title: "Section completed locally",
          description: "Completion saved locally. Check your Airtable connection in Settings.",
          variant: "default",
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

      // Don't revert local state, just show warning
      toast({
        title: "Section completed locally",
        description: "Completion saved locally. Check your connection and try again later.",
        variant: "default",
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
  const currentSectionIndex = getSectionIndex(sectionId)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card
        className={`transition-all duration-200 ${finalIsCompleted ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {finalIsCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
              {sectionTitle}
              {finalIsCompleted && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  Complete
                </Badge>
              )}
              {isCollaborative && (
                <Badge variant="outline" className="text-xs">
                  Live
                </Badge>
              )}
              {!isOnline && (
                <Badge variant="destructive" className="text-xs">
                  Offline
                </Badge>
              )}
            </CardTitle>

            <div className="flex items-center gap-2">
              {/* Collaborative users */}
              {isCollaborative && usersInSection.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div className="flex -space-x-1">
                    {usersInSection.slice(0, 3).map((user: any) => (
                      <Tooltip key={user.id}>
                        <TooltipTrigger asChild>
                          <Avatar className="w-6 h-6 ring-2 ring-background">
                            <AvatarImage src={user.presence?.user?.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {user.presence?.user?.name?.charAt(0).toUpperCase() || "A"}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{user.presence?.user?.name || "Anonymous"} is viewing this section</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {usersInSection.length > 3 && (
                      <div className="w-6 h-6 bg-muted rounded-full ring-2 ring-background flex items-center justify-center">
                        <span className="text-xs font-medium">+{usersInSection.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Save status */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {!isOnline ? (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span>Offline</span>
                  </>
                ) : isSaving ? (
                  <>
                    <Save className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : saveError ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span>Error</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{saveError}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : lastSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 text-blue-500" />
                    <span>Local</span>
                  </>
                )}
              </div>
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

        <CardContent className="space-y-4">
          <Textarea
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`Enter your ${sectionTitle.toLowerCase()} here...`}
            className="min-h-[200px] resize-none"
            disabled={finalIsCompleted}
          />

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
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ This section was completed on {new Date(currentSection.lastModified).toLocaleDateString()}
                by {currentSection.modifiedBy}
              </p>
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
              Section {currentSectionIndex + 1} of {businessPlanSections.length}
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
    </TooltipProvider>
  )
}
