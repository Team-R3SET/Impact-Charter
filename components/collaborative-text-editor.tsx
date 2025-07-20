"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, Clock, Users, Save, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
}

export function CollaborativeTextEditor({
  sectionId,
  sectionTitle,
  planId,
  currentUser,
}: CollaborativeTextEditorProps) {
  const [localContent, setLocalContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isCollaborative, setIsCollaborative] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()
  const room = useRoom ? useRoom() : null
  const collaborativeHooks = room
    ? {
        myPresence: useMyPresence ? useMyPresence() : [null, () => {}],
        others: useOthers ? useOthers() : [],
        sections: useStorage ? useStorage((root) => root?.sections) : null,
        completedSections: useStorage ? useStorage((root) => root?.completedSections) : null,
        broadcast: useBroadcastEvent ? useBroadcastEvent() : () => {},
        updateSection: useMutation
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
          : null,
        markSectionComplete: useMutation
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
          : null,
      }
    : null
  const usersTyping = isCollaborative
    ? collaborativeHooks?.others?.filter(
        (user: any) =>
          user.presence?.isTyping?.sectionId === sectionId && Date.now() - user.presence.isTyping.timestamp < 3000,
      ) || []
    : []
  const usersInSection = isCollaborative
    ? collaborativeHooks?.others?.filter((user: any) => user.presence?.selectedSection === sectionId) || []
    : []

  useEffect(() => {
    setIsCollaborative(!!room)
  }, [room])

  useEffect(() => {
    if (!collaborativeHooks) return

    const [, updateMyPresence] = collaborativeHooks.myPresence
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
  }, [sectionId, currentUser, collaborativeHooks])

  const saveToAirtable = useCallback(
    async (content: string) => {
      try {
        setIsSaving(true)
        const response = await fetch(`/api/business-plans/${planId}/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionName: sectionId,
            sectionContent: content,
            userEmail: currentUser.email,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to save")
        }

        setLastSaved(new Date())
        toast({
          title: "Section saved",
          description: "Your changes have been saved successfully.",
        })
      } catch (error) {
        console.error("Failed to save to Airtable:", error)
        toast({
          title: "Save failed",
          description: error instanceof Error ? error.message : "Failed to save changes. Working in local mode.",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    },
    [planId, sectionId, currentUser.email, toast],
  )

  const handleContentChange = useCallback(
    (content: string) => {
      setLocalContent(content)

      if (!isCollaborative) {
        localStorage.setItem(`section-${planId}-${sectionId}`, content)
      }

      if (collaborativeHooks?.updateSection) {
        collaborativeHooks.updateSection(content)
      }

      if (collaborativeHooks?.broadcast) {
        collaborativeHooks.broadcast({
          type: "TEXT_CHANGE",
          sectionId,
          content,
          userId: currentUser.email,
        })
      }

      if (collaborativeHooks) {
        const [, updateMyPresence] = collaborativeHooks.myPresence
        updateMyPresence({
          isTyping: { sectionId, timestamp: Date.now() },
        })
      }

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveToAirtable(content)
      }, 2000)
    },
    [isCollaborative, planId, sectionId, collaborativeHooks, currentUser.email, saveToAirtable],
  )

  const handleMarkComplete = async () => {
    try {
      setIsCompleting(true)

      setIsCompleted(true)

      if (!isCollaborative) {
        localStorage.setItem(`section-${planId}-${sectionId}-completed`, JSON.stringify(true))
      }

      if (collaborativeHooks?.markSectionComplete) {
        collaborativeHooks.markSectionComplete()
      }

      const response = await fetch(`/api/business-plans/${planId}/sections/${sectionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: currentUser.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to mark as complete")
      }

      if (collaborativeHooks?.broadcast) {
        collaborativeHooks.broadcast({
          type: "SECTION_COMPLETED",
          sectionId,
          userId: currentUser.email,
        })
      }

      toast({
        title: "Section completed!",
        description: `${sectionTitle} has been marked as complete and submitted for review.`,
      })
    } catch (error) {
      console.error("Failed to mark as complete:", error)
      setIsCompleted(false)
      if (!isCollaborative) {
        localStorage.setItem(`section-${planId}-${sectionId}-completed`, JSON.stringify(false))
      }
      toast({
        title: "Failed to mark as complete",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCompleting(false)
    }
  }

  useEffect(() => {
    if (collaborativeHooks?.sections && collaborativeHooks.sections[sectionId]) {
      setLocalContent(collaborativeHooks.sections[sectionId].content || "")
      setIsCompleted(collaborativeHooks.sections[sectionId].isCompleted || false)
    } else {
      const savedContent = localStorage.getItem(`section-${planId}-${sectionId}`)
      const savedCompletion = localStorage.getItem(`section-${planId}-${sectionId}-completed`)
      if (savedContent) {
        setLocalContent(savedContent)
      }
      if (savedCompletion) {
        setIsCompleted(JSON.parse(savedCompletion))
      }
    }
    setIsLoading(false)
  }, [collaborativeHooks?.sections, sectionId, planId])

  const currentSection = collaborativeHooks?.sections?.[sectionId]
  const completedFromStorage =
    collaborativeHooks?.completedSections?.[sectionId] || currentSection?.isCompleted || false
  const finalIsCompleted = isCollaborative ? completedFromStorage : isCompleted

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
            </CardTitle>

            <div className="flex items-center gap-2">
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

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {isSaving ? (
                  <>
                    <Save className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span>Unsaved</span>
                  </>
                )}
              </div>
            </div>
          </div>

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
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
