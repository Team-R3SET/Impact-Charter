"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, Clock, Users, Save, AlertCircle, Wifi, WifiOff, ChevronLeft, ChevronRight, Maximize, Minimize, Bold, Italic, Underline, XCircle, MessageCircle } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { businessPlanSections, getNextSection, getPreviousSection, getSectionIndex } from "@/lib/business-plan-sections"
import { logAccess, logError } from "@/lib/logging"
import type { User } from "@/lib/user-types"
import { CommentsPanel } from "./comments-panel"
import { useRoom, useMutation, useStorage, useSelf, useOthers } from "@liveblocks/react"

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
  const room = useRoom()
  const [localContent, setLocalContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isCollaborative, setIsCollaborative] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [selectedText, setSelectedText] = useState<{start: number, end: number, text: string} | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [currentSectionData, setCurrentSectionData] = useState<{ title: string, description: string }>({ title: "", description: "" })

  const [myPresence, updateMyPresence] = useSelf ? useSelf() : [null, () => {}]
  const others = useOthers ? useOthers() : []
  const sections = useStorage ? useStorage((root) => root?.sections) : null
  const completedSections = useStorage ? useStorage((root) => root?.completedSections) : null
  const comments = useStorage ? useStorage((root) => root?.comments || {}) : {}
  const broadcast = useRoom ? useRoom().broadcast : () => {}

  const sectionComments = comments && typeof comments === 'object' 
    ? Object.values(comments).filter((comment: any) => comment?.sectionId === sectionId)
    : []
  const unresolvedCommentsCount = sectionComments.filter((comment: any) => !comment?.resolved).length

  const handleTextSelection = useCallback(() => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    if (start !== end) {
      const selectedText = localContent.substring(start, end)
      setSelectedText({ start, end, text: selectedText })
    } else {
      setSelectedText(null)
    }
  }, [localContent])

  const handleAddComment = useCallback(() => {
    setShowComments(true)
  }, [])

  const saveToAirtable = useCallback(
    async (content: string) => {
      if (!isOnline) {
        setSaveError("You're offline. Changes will be saved locally.")
        return
      }

      try {
        setIsSaving(true)
        setSaveError(null)

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

        let result: any = null
        const rawBody = await response.text()

        try {
          result = JSON.parse(rawBody)
        } catch {
          result = { raw: rawBody }
        }

        if (!response.ok) {
          await logError(
            result?.error || rawBody || `HTTP ${response.status}`,
            "API_ERROR",
            response.status >= 500 ? "HIGH" : "MEDIUM",
            window.location.href,
            currentUser as User,
            undefined,
            result instanceof Error ? result.stack : undefined,
            { planId, sectionId, statusCode: response.status },
          )
          throw new Error(result?.error || `Server error: ${response.status}`)
        }

        if (result.success) {
          setLastSaved(new Date())
          setSaveError(null)
          toast({
            title: "Section saved",
            description: "Your changes have been saved successfully.",
          })
        } else {
          throw new Error(result.error || "Unexpected server reply")
        }
      } catch (error) {
        console.error("Failed to save to Airtable:", error)

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        setSaveError(errorMessage)

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

  const handleContentChange = useCallback(
    (content: string) => {
      setLocalContent(content)

      localStorage.setItem(`section-${planId}-${sectionId}`, content)

      if (updateSection) {
        updateSection(content)
      }

      if (broadcast) {
        broadcast({
          type: "TEXT_CHANGE",
          sectionId,
          content,
          userId: currentUser.email,
        })
      }

      if (room) {
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
    [planId, sectionId, updateSection, broadcast, room, updateMyPresence, saveToAirtable],
  )

  const handleMarkComplete = async () => {
    try {
      setIsCompleting(true)
      setSaveError(null)

      await logAccess(
        currentUser as User,
        "COMPLETE_SECTION",
        `plan/${planId}/section/${sectionId}`,
        true,
        "Section marked as complete",
      )

      setIsCompleted(true)
      localStorage.setItem(`section-${planId}-${sectionId}-completed`, JSON.stringify(true))

      onSectionComplete?.(sectionId, true)

      if (markSectionComplete) {
        markSectionComplete()
      }

      const response = await fetch(`/api/business-plans/${planId}/sections/${sectionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: currentUser.email,
        }),
      })

      if (response.ok) {
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
        const errorData = await response.json().catch(() => ({ error: "Unknown error", errorDetails: null }))
        console.warn("Failed to save completion to Airtable:", errorData)

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

  const handleMarkIncomplete = async () => {
    try {
      setIsCompleting(true)
      setSaveError(null)

      await logAccess(
        currentUser as User,
        "MARK_INCOMPLETE",
        `plan/${planId}/section/${sectionId}`,
        true,
        "Section marked as incomplete",
      )

      setIsCompleted(false)
      localStorage.setItem(`section-${planId}-${sectionId}-completed`, JSON.stringify(false))

      onSectionComplete?.(sectionId, false)

      if (markSectionIncomplete) {
        markSectionIncomplete()
      }

      const response = await fetch(`/api/business-plans/${planId}/sections/${sectionId}/incomplete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedBy: currentUser.email,
        }),
      })

      if (response.ok) {
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

  useEffect(() => {
    if (sections && sections[sectionId]) {
      setLocalContent(sections[sectionId].content || "")
      setIsCompleted(sections[sectionId].isCompleted || false)
    } else {
      const savedContent = localStorage.getItem(`section-${planId}-${sectionId}`)
      const savedCompletion = localStorage.getItem(`section-${planId}-${sectionId}-completed`)

      if (savedContent) {
        setLocalContent(savedContent)
      }
      if (savedCompletion) {
        const completed = JSON.parse(savedCompletion)
        setIsCompleted(completed)
        onSectionComplete?.(sectionId, completed)
      }
    }
    setIsLoading(false)
  }, [sections, sectionId, planId, onSectionComplete])

  const currentSection = sections?.[sectionId]
  const completedFromStorage = completedSections?.[sectionId] || currentSection?.isCompleted || false
  const finalIsCompleted = isCompleted || (isCollaborative ? completedFromStorage : false)

  const applyFormatting = useCallback((format: 'bold' | 'italic' | 'underline') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    let command = '';
    switch (format) {
      case 'bold':
        command = 'bold';
        break;
      case 'italic':
        command = 'italic';
        break;
      case 'underline':
        command = 'underline';
        break;
    }

    document.execCommand(command, false);
    
    if (textareaRef.current) {
      const newContent = htmlToMarkdown(textareaRef.current.innerHTML);
      setLocalContent(newContent);
    }
  }, [])

  const parseMarkdown = (text: string) => {
    if (!text) return '';
    
    let parsedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    parsedText = parsedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    parsedText = parsedText.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
    
    parsedText = parsedText.replace(/\n/g, '<br>');
    
    return parsedText;
  };

  const htmlToMarkdown = (html: string) => {
    if (!html) return '';
    
    let markdownText = html.replace(/<br\s*\/?>/g, '\n');
    markdownText = markdownText.replace(/<div>/g, '\n');
    markdownText = markdownText.replace(/<\/div>/g, '');
    
    markdownText = markdownText.replace(/<(strong|b)>(.*?)<\/(strong|b)>/g, '**$2**');
    
    markdownText = markdownText.replace(/<(em|i)>(.*?)<\/(em|i)>/g, '*$2*');
    
    markdownText = markdownText.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
    
    markdownText = markdownText.replace(/<(?!u\b|\/u\b)[^>]*>/g, '');
    
    markdownText = markdownText.replace(/\n+/g, '\n').trim();
    
    return markdownText;
  };

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

  useEffect(() => {
    setIsCollaborative(!!room)
  }, [room])

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

  const usersTyping = isCollaborative && Array.isArray(others)
    ? others.filter(
        (user: any) =>
          user?.presence?.isTyping?.sectionId === sectionId && 
          Date.now() - (user?.presence?.isTyping?.timestamp || 0) < 3000,
      )
    : []

  const usersInSection = isCollaborative && Array.isArray(others)
    ? others.filter((user: any) => user?.presence?.selectedSection === sectionId)
    : []

  const handlePreviousSection = useCallback(() => {
    const prevSection = getPreviousSection(sectionId)
    if (prevSection) {
      onSectionSelect?.(prevSection.id)
    }
  }, [sectionId, onSectionSelect])

  const handleNextSection = useCallback(() => {
    const nextSection = getNextSection(sectionId)
    if (nextSection) {
      onSectionSelect?.(nextSection.id)
    }
  }, [sectionId, onSectionSelect])

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
    <div className="relative">
      <Card className={`${isFullScreen ? "fixed inset-4 z-50 flex flex-col" : ""} ${showComments ? "mr-96" : ""}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="text-xl">{currentSectionData.title || sectionTitle}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentSectionData.description || "Complete this section of your business plan"}
                </p>
              </div>
              {finalIsCompleted && (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isCollaborative && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={showComments ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowComments(!showComments)}
                        className="relative"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {unresolvedCommentsCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                          >
                            {unresolvedCommentsCount}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {showComments ? "Hide comments" : "Show comments"}
                      {unresolvedCommentsCount > 0 && ` (${unresolvedCommentsCount} unresolved)`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousSection}
                        disabled={getSectionIndex(sectionId) === 0}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Previous section</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextSection}
                        disabled={getSectionIndex(sectionId) === businessPlanSections.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Next section</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

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
                          <Minimize className="w-4 h-4" />
                        ) : (
                          <Maximize className="w-4 h-4" />
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
                  Live
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

          {usersTyping.length > 0 && Array.isArray(usersTyping) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex -space-x-1">
                {usersTyping.map((user: any) => (
                  <Avatar key={user.id} className="w-4 h-4">
                    <AvatarImage src={user?.presence?.user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {user?.presence?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span>
                {usersTyping.map((u: any) => u?.presence?.user?.name || "Someone").join(", ")}
                {usersTyping.length === 1 ? " is" : " are"} typing...
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className={isFullScreen ? "flex-1 flex flex-col" : ""}>
          <div className={isFullScreen ? "flex-1 flex flex-col" : ""}>
            {finalIsCompleted ? (
              <div 
                className="min-h-[400px] p-4 text-base leading-relaxed overflow-auto"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(localContent) }}
              />
            ) : (
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={localContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onSelect={handleTextSelection}
                  onMouseUp={handleTextSelection}
                  onKeyUp={handleTextSelection}
                  placeholder={`Write your ${sectionTitle.toLowerCase()} here...`}
                  className={`min-h-[400px] text-base leading-relaxed resize-none ${
                    isFullScreen ? "flex-1" : ""
                  }`}
                  disabled={isLoading}
                />
                
                {selectedText && isCollaborative && (
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      className="shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Comment on selection
                    </Button>
                  </div>
                )}

                {isLoading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            )}

            {localContent && !finalIsCompleted && (
              <div className="mt-6 border-t pt-6">
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Preview</h4>
                <div 
                  className="prose prose-sm max-w-none text-sm leading-relaxed p-4 bg-muted/30 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(localContent) }}
                />
              </div>
            )}
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

          {finalIsCompleted && (
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
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  {isCompleting ? (
                    <>
                      <XCircle className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Mark Incomplete
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CommentsPanel
        sectionId={sectionId}
        currentUser={currentUser}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  )
}
