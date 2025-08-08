"use client"

import React, { useState, useEffect, useCallback, useRef, useContext } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ResizableHandle, ResizablePanel, ResizablePanel as Panel, ResizablePanelGroup } from "@/components/ui/resizable"
import { CommentsPanel } from "./comments-panel"
import { LivePresenceHeader } from "./live-presence-header"
import { MessageSquare, Users, Maximize2, Minimize2, CheckCircle2, Circle, Eye, Edit3, Clock } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { businessPlanSections, getSectionIndex } from "@/lib/business-plan-sections"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// LiveBlocks imports
import { 
  useRoom, 
  useMutation, 
  useStorage, 
  useSelf, 
  useOthers, 
  useMyPresence,
  RoomContext
} from "@liveblocks/react"

// Lexical imports
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $getSelection, $createParagraphNode, $createTextNode } from 'lexical'
import { HeadingNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'

function LiveCursor({ user, position }: { user: any; position: { x: number; y: number } }) {
  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="flex items-center gap-1">
        <div
          className="w-0.5 h-6 animate-pulse"
          style={{ backgroundColor: user.color || '#3b82f6' }}
        />
        <div
          className="px-2 py-1 rounded text-xs text-white whitespace-nowrap"
          style={{ backgroundColor: user.color || '#3b82f6' }}
        >
          {user.name}
        </div>
      </div>
    </div>
  )
}

function LiveSelection({ user, selection }: { user: any; selection: { start: number; end: number } }) {
  return (
    <div
      className="absolute pointer-events-none z-40 rounded"
      style={{
        backgroundColor: `${user.color || '#3b82f6'}20`,
        border: `1px solid ${user.color || '#3b82f6'}40`,
      }}
    >
      <div
        className="absolute -top-5 left-0 px-1 py-0.5 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: user.color || '#3b82f6' }}
      >
        {user.name}
      </div>
    </div>
  )
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
  initialContent?: string
  onContentChange?: (content: string) => void
  placeholder?: string
  readOnly?: boolean
  showControls?: boolean
  showComments?: boolean
  showCompletionControls?: boolean
  showCollaborationStatus?: boolean
  autoSaveInterval?: number
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
  initialContent = "",
  onContentChange,
  placeholder = "Start writing your business plan...",
  readOnly = false,
  showControls = true,
  showComments = true,
  showCompletionControls = true,
  showCollaborationStatus = true,
  autoSaveInterval = 2000,
}: CollaborativeTextEditorProps) {
  let roomContext = null
  let isLiveblocksAvailable = false
  
  try {
    roomContext = useContext(RoomContext)
    isLiveblocksAvailable = roomContext !== null
  } catch (error) {
    // LiveBlocks context not available
    isLiveblocksAvailable = false
  }

  const room = roomContext ? useRoom() : null
  
  const [localContent, setLocalContent] = useState(initialContent)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isCollaborative, setIsCollaborative] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [showCommentsPanel, setShowCommentsPanel] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const [liveCursors, setLiveCursors] = useState<Array<{ user: any; position: { x: number; y: number } }>>([])
  const [liveSelections, setLiveSelections] = useState<Array<{ user: any; selection: { start: number; end: number } }>>([])
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()
  const editorRef = useRef<HTMLDivElement>(null)

  // Conditionally create LiveBlocks mutations only when context is available
  const updateSection = roomContext && useMutation
    ? useMutation(
        ({ storage }, content: string) => {
          if (!storage.get("sections")) {
            storage.set("sections", new Map())
          }
          if (!storage.get("completedSections")) {
            storage.set("completedSections", new Map())
          }
          const sections = storage.get("sections")
          sections.set(sectionId, content)
        },
        [sectionId]
      )
    : null

  // Safely initialize LiveBlocks data with conditional hooks
  let myPresence: any = null
  let updateMyPresence: any = null
  let others: any[] = []
  let storage: any = null
  let broadcast: any = null
  let comments: any = {}
  let addComment: any = null

  if (roomContext) {
    try {
      const selfData = useSelf()
      const [presence, setPresence] = useMyPresence()
      const othersData = useOthers()
      
      myPresence = presence
      updateMyPresence = setPresence
      others = othersData || []
      storage = useStorage((root) => root) || {}
      broadcast = room?.broadcastEvent
      comments = storage?.comments || {}
      
      // Properly create the addComment mutation function
      addComment = useMutation(
        ({ storage }, commentContent: string, position: any) => {
          let commentsMap = storage.get("comments")
          if (!commentsMap || !(commentsMap instanceof Map)) {
            commentsMap = new Map()
            storage.set("comments", commentsMap)
          }

          const commentId = `${sectionId}-${Date.now()}`
          commentsMap.set(commentId, {
            id: commentId,
            content: commentContent,
            position,
            sectionId,
            author: selfData?.info?.name || 'Anonymous',
            authorId: selfData?.connectionId || 'unknown',
            timestamp: Date.now(),
            resolved: false,
            replies: []
          })
        },
        [sectionId, selfData]
      )

      useEffect(() => {
        const cursors: Array<{ user: any; position: { x: number; y: number } }> = []
        const selections: Array<{ user: any; selection: { start: number; end: number } }> = []
        
        othersData.forEach((other) => {
          if (other.presence?.selectedSection === sectionId) {
            if (other.presence?.textCursor) {
              cursors.push({
                user: other.presence.user,
                position: other.presence.textCursor
              })
            }
            if (other.presence?.textSelection) {
              selections.push({
                user: other.presence.user,
                selection: other.presence.textSelection
              })
            }
          }
        })
        
        setLiveCursors(cursors)
        setLiveSelections(selections)
      }, [othersData, sectionId])
    } catch (error) {
      console.log("LiveBlocks hooks not available, using local mode")
    }
  }

  const sectionComments = comments && typeof comments === 'object' 
    ? Object.values(comments).filter((comment: any) => comment?.sectionId === sectionId)
    : []

  const unresolvedCommentsCount = sectionComments.filter((comment: any) => !comment?.resolved).length

  // Updated handleTextSelection to work with Lexical editor and update presence
  const handleTextSelection = useCallback(() => {
    // This will be handled by Lexical's selection system
    // We'll implement this in the Lexical plugin
  }, [])

  const handleAddComment = useCallback(() => {
    console.log('Add comment clicked', { selectedText, isCollaborative, addComment: !!addComment })
    
    // Always show comments panel first, then create comment if conditions are met
    setShowCommentsPanel(true)
    
    // If no selected text, just open the panel
    if (!selectedText) {
      console.log('No selected text, just opening comments panel')
      return
    }

    // Create comment regardless of isCollaborative flag for testing
    if (addComment) {
      try {
        const position = {
          start: selectionStart,
          end: selectionEnd,
          selectedText: selectedText
        }
        
        // Create a comment with the selected text as context
        const commentContent = `Comment on: "${selectedText}"`
        console.log('Creating comment with:', { commentContent, position })
        
        addComment(commentContent, position)
        
        // Clear selection after creating comment
        setSelectedText("")
        setSelectionStart(0)
        setSelectionEnd(0)
        
        console.log('Comment created successfully')
      } catch (error) {
        console.error('Failed to create comment:', error)
      }
    } else {
      console.warn('addComment function not available, isCollaborative:', isCollaborative)
      // For non-collaborative mode, create a simple local comment
      if (!isCollaborative) {
        console.log('Creating local comment for non-collaborative mode')
        // This would be handled by the comments panel in non-collaborative mode
      }
    }
  }, [selectedText, isCollaborative, addComment, selectionStart, selectionEnd])

  const saveToAirtable = useCallback(
    async (content: string) => {
      if (!isOnline) {
        setSaveError("You're offline. Changes will be saved locally.")
        return
      }

      try {
        setIsSaving(true)
        setSaveError(null)

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

  useEffect(() => {
    const handleResizeObserverError = (e: ErrorEvent) => {
      if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    window.addEventListener('error', handleResizeObserverError)
    return () => window.removeEventListener('error', handleResizeObserverError)
  }, [])

  // Updated handleContentChange to work with Lexical EditorState and update presence
  const handleContentChange = useCallback(
    (editorState: any) => {
      try {
        editorState.read(() => {
          try {
            const root = $getRoot()
            const content = root.getTextContent()
            
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
                user: currentUser.email,
              })
            }

            if (updateMyPresence) {
              updateMyPresence({
                selectedSection: sectionId,
                isTyping: { sectionId, timestamp: Date.now() },
                user: {
                  name: currentUser.name,
                  email: currentUser.email,
                  avatar: currentUser.avatar || '',
                },
              })
            }

            if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current)
            }
            saveTimeoutRef.current = setTimeout(() => {
              saveToAirtable(content)
            }, autoSaveInterval)

            if (onContentChange) {
              onContentChange(content)
            }
          } catch (error) {
            console.error("Error in handleContentChange read:", error)
          }
        })
      } catch (error) {
        console.error("Error in handleContentChange:", error)
      }
    },
    [planId, sectionId, updateSection, broadcast, updateMyPresence, saveToAirtable, onContentChange, currentUser, autoSaveInterval],
  )

  function SelectionPlugin() {
    const [editor] = useLexicalComposerContext()
    
    useEffect(() => {
      if (!editor) return
      
      return editor.registerUpdateListener(({ editorState }) => {
        try {
          editorState.read(() => {
            try {
              const selection = $getSelection()
              if (selection) {
                const selectedText = selection.getTextContent()
                if (selectedText) {
                  setSelectedText(selectedText)
                  
                  if (updateMyPresence) {
                    updateMyPresence({
                      selectedSection: sectionId,
                      textSelection: {
                        sectionId,
                        start: 0, // Lexical selection would provide actual positions
                        end: selectedText.length,
                      },
                      user: {
                        name: currentUser.name,
                        email: currentUser.email,
                        avatar: currentUser.avatar || '',
                      },
                    })
                  }
                }
              }
            } catch (error) {
              console.error("Error in SelectionPlugin selection read:", error)
            }
          })
        } catch (error) {
          console.error("Error in SelectionPlugin update listener:", error)
        }
      })
    }, [editor, updateMyPresence])

    return null
  }

  const handleMarkComplete = async () => {
    try {
      setIsCompleting(true)
      setSaveError(null)

      setIsCompleted(true)
      localStorage.setItem(`section-${planId}-${sectionId}-completed`, JSON.stringify(true))

      onSectionComplete?.(sectionId, true)

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
            user: currentUser.email,
          })
        }

        toast({
          title: "Section completed!",
          description: `${sectionTitle} has been marked as complete and submitted for review.`,
        })
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error", errorDetails: null }))
        console.warn("Failed to save completion to Airtable:", errorData)

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

      setIsCompleted(false)
      localStorage.setItem(`section-${planId}-${sectionId}-completed`, JSON.stringify(false))

      onSectionComplete?.(sectionId, false)

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
            user: currentUser.email,
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
    setIsLoading(false)
  }, [sectionId, planId])

  const currentSection = storage?.sections?.[sectionId]
  const completedFromStorage = storage?.completedSections?.[sectionId] || currentSection?.isCompleted || false
  const finalIsCompleted = isCompleted || (isCollaborative ? completedFromStorage : false)

  function NonCollaborativeLexicalEditor() {
    const initialConfig = {
      namespace: `section-${sectionId}`,
      nodes: [HeadingNode, ListNode, ListItemNode],
      editorState: null,
      onChange: handleContentChange,
      theme: {
        paragraph: "mb-2",
        text: {
          bold: "font-bold",
          italic: "italic",
          underline: "underline",
        },
      },
      onError: (error: Error) => {
        console.error("Lexical error:", error)
      },
    }

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <div className={`relative ${isFullScreen ? "flex-1 flex flex-col" : ""}`}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`min-h-[400px] p-4 text-base leading-relaxed resize-none outline-none ${
                  isFullScreen ? "flex-1" : ""
                }`}
                style={{ minHeight: isFullScreen ? "60vh" : "400px" }}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <SelectionPlugin />
          <HistoryPlugin />
          <AutoFocusPlugin />
        </div>
      </LexicalComposer>
    )
  }

  function CollaborativeLexicalEditor() {
    const [LiveblocksPlugin, setLiveblocksPlugin] = useState<any>(null)
    
    useEffect(() => {
      // Only load LiveblocksPlugin if we're actually in a LiveBlocks context
      if (!isLiveblocksAvailable) {
        return
      }
      
      const loadLiveblocksPlugin = async () => {
        try {
          const module = await import("@liveblocks/react-lexical")
          setLiveblocksPlugin(() => module.LiveblocksPlugin)
        } catch (error) {
          console.error("Failed to load LiveblocksPlugin:", error)
        }
      }
      loadLiveblocksPlugin()
    }, [])

    const initialConfig = {
      namespace: `section-${sectionId}`,
      nodes: [HeadingNode, ListNode, ListItemNode],
      editorState: null,
      onChange: handleContentChange,
      theme: {
        paragraph: "mb-2",
        text: {
          bold: "font-bold",
          italic: "italic",
          underline: "underline",
        },
      },
      onError: (error: Error) => {
        console.error("Lexical error:", error)
      },
    }

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <div className={`relative ${isFullScreen ? "flex-1 flex flex-col" : ""}`}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`min-h-[400px] p-4 text-base leading-relaxed resize-none outline-none ${
                  isFullScreen ? "flex-1" : ""
                }`}
                style={{ minHeight: isFullScreen ? "60vh" : "400px" }}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <SelectionPlugin />
          <HistoryPlugin />
          <AutoFocusPlugin />
          {/* Only render LiveblocksPlugin if it's loaded and we're in LiveBlocks context */}
          {LiveblocksPlugin && isLiveblocksAvailable && <LiveblocksPlugin />}
        </div>
      </LexicalComposer>
    )
  }

  useEffect(() => {
    setIsCollaborative(!!room)
  }, [room])

  useEffect(() => {
    if (updateMyPresence && isCollaborative) {
      updateMyPresence({
        section: sectionId,
        activity: "viewing",
        lastActive: Date.now(),
      })
    }
  }, [sectionId, isCollaborative, updateMyPresence])

  const usersTyping = isCollaborative && Array.isArray(others)
    ? others.filter(
        (user: any) =>
          user?.presence?.section === sectionId && 
          user?.presence?.activity === "editing" && 
          Date.now() - (user?.presence?.lastActive || 0) < 3000,
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
    <div className={`border rounded-lg overflow-hidden bg-background ${isFullScreen ? "fixed inset-0 z-50 flex flex-col" : ""}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-xl">{sectionTitle}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete this section of your business plan
              </p>
            </div>
            {finalIsCompleted && (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isCollaborative && showComments && others.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  {others
                    .filter((other) => other.presence?.selectedSection === sectionId)
                    .slice(0, 3)
                    .map((other) => (
                      <div key={other.connectionId}>
                        {/* Tooltip component is not imported, so it's assumed to be available */}
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 border-2 border-background">
                            <div className="w-6 h-6 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${other.info?.avatar || "/placeholder.svg"})` }} />
                            <div className="text-xs text-white absolute top-0 left-0 w-6 h-6 flex items-center justify-center rounded-full bg-black/50">
                              {other.info?.name?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {other.info?.name || 'Anonymous'} is viewing this section
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {others.filter((other) => other.presence?.selectedSection === sectionId).length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{others.filter((other) => other.presence?.selectedSection === sectionId).length - 3} more
                  </span>
                )}
              </div>
            )}

            {isCollaborative && showControls && (
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button
                    className={`relative ${showCommentsPanel ? "bg-blue-600 text-white" : "bg-white text-black border border-black"}`}
                    onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    {unresolvedCommentsCount > 0 && (
                      <div 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center bg-red-600 text-white rounded-full"
                      >
                        {unresolvedCommentsCount}
                      </div>
                    )}
                  </button>
                  <div className="text-xs text-muted-foreground">
                    {showCommentsPanel ? "Hide comments" : "Show comments"}
                    {unresolvedCommentsCount > 0 && ` (${unresolvedCommentsCount} unresolved)`}
                  </div>
                </div>
              </div>
            )}

            {isCollaborative && showControls && (
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <button
                    className="bg-white text-black border border-black h-8 w-8 p-0"
                    onClick={handlePreviousSection}
                    disabled={getSectionIndex(sectionId) === 0}
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  <div className="text-xs text-muted-foreground">
                    Previous section
                  </div>
                </div>
              </div>
            )}

            {isCollaborative && showControls && (
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <button
                    className="bg-white text-black border border-black h-8 w-8 p-0"
                    onClick={handleNextSection}
                    disabled={getSectionIndex(sectionId) === businessPlanSections.length - 1}
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  <div className="text-xs text-muted-foreground">
                    Next section
                  </div>
                </div>
              </div>
            )}

            {onToggleFullScreen && showControls && (
              <div className="flex items-center gap-1">
                <button
                  className="bg-white text-black border border-black h-8 w-8 p-0"
                  onClick={onToggleFullScreen}
                >
                  {isFullScreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <div className="text-xs text-muted-foreground">
                  {isFullScreen ? "Exit full screen" : "Enter full screen"}
                </div>
              </div>
            )}
            
            {isCollaborative && showCollaborationStatus && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="text-xs text-green-800">
                  Live
                </div>
              </div>
            )}
          </div>
        </div>

        <CardContent className={`space-y-4 ${isFullScreen ? "flex-1 flex flex-col" : ""}`}>
          <div className="space-y-2">
            {/* Replaced textarea with Lexical multiplayer editor */}
            <div className={`border rounded-md relative ${isFullScreen ? "flex-1 flex flex-col" : ""}`} ref={editorRef}>
              {liveCursors.map((cursor, index) => (
                <LiveCursor key={index} user={cursor.user} position={cursor.position} />
              ))}
              {liveSelections.map((selection, index) => (
                <LiveSelection key={index} user={selection.user} selection={selection.selection} />
              ))}
              
              {isLiveblocksAvailable ? <CollaborativeLexicalEditor /> : <NonCollaborativeLexicalEditor />}
            </div>
            
            {selectedText && showControls && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? "..." : ""}"
                </span>
                <button
                  className="bg-white text-black border border-black h-6 px-2 text-xs"
                  onClick={handleAddComment}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Comment on selection
                </button>
              </div>
            )}

            {finalIsCompleted ? (
              <div 
                className="min-h-[400px] p-4 text-base leading-relaxed overflow-auto"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(localContent) }}
              />
            ) : (
              <div className="relative">
                {/* Lexical editor is used instead of textarea */}
              </div>
            )}

            {localContent && !finalIsCompleted && showControls && (
              <div className="mt-6 border-t pt-6">
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Preview</h4>
                <div 
                  className="prose prose-sm max-w-none text-sm leading-relaxed p-4 bg-muted/30 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(localContent) }}
                />
              </div>
            )}
          </div>

          {!finalIsCompleted && showCompletionControls && (
            <>
              <Separator />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Complete this section when you're ready to submit it for review.
                </p>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleMarkComplete}
                  disabled={isCompleting || !localContent.trim()}
                >
                  {isCompleting ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 animate-spin" />
                      Marking Complete...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {finalIsCompleted && showControls && (
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ This section was completed{currentSection?.lastModified ? ` on ${new Date(currentSection.lastModified).toLocaleDateString()}` : ''}
                  {currentSection?.modifiedBy ? ` by ${currentSection.modifiedBy}` : ''}
                </p>
                <button
                  className="bg-white text-black border border-black h-8 w-8 p-0"
                  onClick={handleMarkIncomplete}
                  disabled={isCompleting}
                >
                  {isCompleting ? (
                    <>
                      <Circle className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 mr-2" />
                      Mark Incomplete
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showCommentsPanel && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center">
          <CommentsPanel
            sectionId={sectionId}
            currentUser={currentUser}
            isOpen={showCommentsPanel}
            onClose={() => setShowCommentsPanel(false)}
          />
        </div>
      )}
    </div>
  )
}

function getPreviousSection(sectionId: string) {
  const currentIndex = businessPlanSections.findIndex(section => section.id === sectionId);
  if (currentIndex > 0) {
    return businessPlanSections[currentIndex - 1];
  }
  return null;
}

function getNextSection(sectionId: string) {
  const currentIndex = businessPlanSections.findIndex(section => section.id === sectionId);
  if (currentIndex < businessPlanSections.length - 1) {
    return businessPlanSections[currentIndex + 1];
  }
  return null;
}

function parseMarkdown(text: string): string {
  if (!text) return ''
  
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/__(.*?)__/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/_(.*?)_/gim, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]*)\]$$([^$$]*)\)/gim, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n/gim, '<br>')
}
