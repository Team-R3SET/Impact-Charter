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

let useRoom: any = null
let useMutation: any = null
let useStorage: any = null
let useSelf: any = null
let useOthers: any = null
let useMyPresence: any = null
let RoomContext: any = null

try {
  const liveblocks = require("@liveblocks/react")
  useRoom = liveblocks.useRoom
  useMutation = liveblocks.useMutation
  useStorage = liveblocks.useStorage
  useSelf = liveblocks.useSelf
  useOthers = liveblocks.useOthers
  useMyPresence = liveblocks.useMyPresence
  RoomContext = liveblocks.RoomContext
} catch (error) {
  // LiveBlocks not available
}

// Simple markdown parser
function parseMarkdown(text: string): string {
  // Added null check to prevent error when text is undefined
  if (!text) return '';
  
  return text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\[([^\]]+)\]$$([^)]+)$$/gim, '<a href="$2">$1</a>')
    .replace(/\n/gim, '<br>')
}

interface CollaborativeTextEditorProps {
  sectionId: string
  initialContent: string
  placeholder?: string
  onContentChange?: (content: string) => void
  onSectionComplete?: () => void
  showControls?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export function CollaborativeTextEditor({
  sectionId,
  initialContent,
  placeholder = "Start writing...",
  onContentChange,
  onSectionComplete,
  showControls = true,
  isFullscreen = false,
  onToggleFullscreen
}: CollaborativeTextEditorProps) {
  let roomContext = null
  let isLiveblocksAvailable = false
  
  try {
    if (RoomContext && useContext) {
      roomContext = useContext(RoomContext)
      isLiveblocksAvailable = roomContext !== null
    }
  } catch (error) {
    // LiveBlocks context not available
    isLiveblocksAvailable = false
  }

  const room = roomContext && useRoom ? useRoom() : null
  
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
  const editorRef = useRef<HTMLTextAreaElement>(null)

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

  let myPresence: any = null
  let updateMyPresence: any = null
  let othersData: any = []
  let comments: any = {}

  if (isLiveblocksAvailable && room) {
    try {
      if (useMyPresence) {
        [myPresence, updateMyPresence] = useMyPresence()
      }
      if (useOthers) {
        othersData = useOthers()
      }
      if (useStorage) {
        comments = useStorage((root) => root.comments) || {}
      }
    } catch (error) {
      console.log("LiveBlocks hooks not available, using local mode")
    }
  }

  const handleContentChange = useCallback((content: string) => {
    setLocalContent(content)
    
    if (updateSection) {
      updateSection(content)
    }
    
    if (onContentChange) {
      onContentChange(content)
    }
    
    // Auto-save functionality
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      setLastSaved(new Date())
      setSaveError(null)
    }, 1000)
  }, [updateSection, onContentChange])

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleContentChange(e.target.value)
  }

  const handleTextSelection = () => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart
      const end = editorRef.current.selectionEnd
      const selected = localContent.substring(start, end)
      
      setSelectedText(selected)
      setSelectionStart(start)
      setSelectionEnd(end)
      
      // Update presence with selection
      if (updateMyPresence && selected) {
        updateMyPresence({
          user: { name: "Current User", avatar: "" },
          section: sectionId,
          activity: "selecting",
          textSelection: { start, end, text: selected }
        })
      }
    }
  }

  const addComment = useCallback((position?: { start: number; end: number; text: string }) => {
    if (!isLiveblocksAvailable || !room) {
      toast({
        title: "Comments not available",
        description: "Comments are only available in collaborative mode.",
        variant: "destructive"
      })
      return
    }

    try {
      const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newComment = {
        id: commentId,
        sectionId,
        content: "",
        author: myPresence?.user || { name: "Anonymous", avatar: "" },
        createdAt: new Date().toISOString(),
        resolved: false,
        position: position || { start: selectionStart, end: selectionEnd, text: selectedText },
        replies: []
      }

      // Add comment to storage
      if (useMutation) {
        const addCommentMutation = useMutation(({ storage }) => {
          const commentsMap = storage.get("comments") || new Map()
          commentsMap.set(commentId, newComment)
          storage.set("comments", commentsMap)
        }, [])
        
        addCommentMutation()
      }

      setShowCommentsPanel(true)
      toast({
        title: "Comment created",
        description: "Your comment has been added successfully."
      })
    } catch (error) {
      console.error("Failed to create comment:", error)
      toast({
        title: "Failed to create comment",
        description: "There was an error creating your comment.",
        variant: "destructive"
      })
    }
  }, [isLiveblocksAvailable, room, sectionId, myPresence, selectionStart, selectionEnd, selectedText, toast])

  const handleAddComment = () => {
    if (selectedText) {
      addComment({
        start: selectionStart,
        end: selectionEnd,
        text: selectedText
      })
    } else {
      setShowCommentsPanel(true)
    }
  }

  useEffect(() => {
    if (updateMyPresence) {
      updateMyPresence({
        user: { name: "Current User", avatar: "" },
        section: sectionId,
        activity: "editing"
      })
    }
  }, [sectionId, updateMyPresence])

  useEffect(() => {
    if (isLiveblocksAvailable && othersData) {
      try {
        const cursors: Array<{ user: any; position: { x: number; y: number } }> = []
        const selections: Array<{ user: any; selection: { start: number; end: number } }> = []
        
        othersData.forEach((other: any) => {
          if (other.presence?.section === sectionId) {
            if (other.presence.cursor) {
              cursors.push({
                user: other.presence.user,
                position: other.presence.cursor
              })
            }
            if (other.presence.textSelection) {
              selections.push({
                user: other.presence.user,
                selection: other.presence.textSelection
              })
            }
          }
        })
        
        setLiveCursors(cursors)
        setLiveSelections(selections)
      } catch (error) {
        console.log("LiveBlocks hooks not available, using local mode")
      }
    }
  }, [othersData, sectionId, isLiveblocksAvailable])

  const sectionComments = comments && typeof comments === 'object' 
    ? Object.values(comments).filter((comment: any) => comment?.sectionId === sectionId)
    : []

  const unresolvedCommentsCount = sectionComments.filter((comment: any) => !comment?.resolved).length

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

  useEffect(() => {
    setIsLoading(false)
    setIsCollaborative(isLiveblocksAvailable && !!room)
  }, [isLiveblocksAvailable, room])

  const handleComplete = async () => {
    if (!localContent.trim()) {
      toast({
        title: "Section incomplete",
        description: "Please add content before marking as complete.",
        variant: "destructive"
      })
      return
    }

    setIsCompleting(true)
    try {
      setIsCompleted(true)
      if (onSectionComplete) {
        onSectionComplete()
      }
      toast({
        title: "Section completed",
        description: "This section has been marked as complete."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete section.",
        variant: "destructive"
      })
    } finally {
      setIsCompleting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn(
      "w-full transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-50 bg-background" : ""
    )}>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={showCommentsPanel ? 70 : 100} minSize={50}>
          <Card className={cn(
            "h-full border-0 shadow-none",
            isFullscreen ? "rounded-none" : ""
          )}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg font-semibold">
                    {businessPlanSections.find(s => s.id === sectionId)?.title || "Section"}
                  </CardTitle>
                  {isCompleted && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                  {isCollaborative && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                      <Users className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {unresolvedCommentsCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/20"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {unresolvedCommentsCount}
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                    className={cn(
                      "transition-colors",
                      showCommentsPanel ? "bg-muted" : ""
                    )}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  
                  {onToggleFullscreen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggleFullscreen}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </div>
              
              {isCollaborative && <LivePresenceHeader />}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isOnline ? "bg-green-500" : "bg-red-500"
                  )} />
                  {isOnline ? "Online" : "Offline"}
                </div>
                
                {isSaving && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Saving...
                  </div>
                )}
                
                {lastSaved && !isSaving && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </div>
                )}
                
                {saveError && (
                  <div className="text-red-500">
                    Save failed: {saveError}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-6 pt-0">
              <div className="relative">
                <Textarea
                  ref={editorRef}
                  value={localContent}
                  onChange={handleTextareaChange}
                  onSelect={handleTextSelection}
                  placeholder={placeholder}
                  className={cn(
                    "min-h-[400px] resize-none border-0 shadow-none focus-visible:ring-0 text-base leading-relaxed",
                    isFullscreen ? "min-h-[60vh]" : ""
                  )}
                />
                
                {/* Live cursors and selections */}
                {liveCursors.map((cursor, index) => (
                  <LiveCursor key={index} user={cursor.user} position={cursor.position} />
                ))}
                {liveSelections.map((selection, index) => (
                  <LiveSelection key={index} user={selection.user} selection={selection.selection} />
                ))}
              </div>
              
              {selectedText && showControls && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md mt-4">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddComment}
                    className="ml-auto"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Comment on selection
                  </Button>
                </div>
              )}
              
              {/* Preview section */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Preview</h4>
                <div 
                  className="prose prose-sm max-w-none text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(localContent) }}
                />
              </div>
            </CardContent>
            
            {showControls && (
              <div className="p-6 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isCompleted ? "secondary" : "default"}
                      onClick={handleComplete}
                      disabled={isCompleting || !localContent.trim()}
                      className={cn(
                        "transition-all",
                        isCompleted && "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100"
                      )}
                    >
                      {isCompleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Completing...
                        </>
                      ) : isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 mr-2" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {localContent.length} characters
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Panel>
        
        {showCommentsPanel && (
          <>
            <ResizableHandle withHandle />
            <Panel defaultSize={30} minSize={25} maxSize={50}>
              <CommentsPanel
                sectionId={sectionId}
                onClose={() => setShowCommentsPanel(false)}
                addComment={addComment}
              />
            </Panel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}

function LiveCursor({ user, position }: { user: any; position: { x: number; y: number } }) {
  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-center gap-1">
        <div className="w-0.5 h-4 bg-blue-500 animate-pulse" />
        <div className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
          {user?.name || "Anonymous"}
        </div>
      </div>
    </div>
  )
}

function LiveSelection({ user, selection }: { user: any; selection: { start: number; end: number } }) {
  return (
    <div className="absolute pointer-events-none bg-blue-200/30 dark:bg-blue-800/30 z-5">
      {/* Selection highlight would be implemented based on text positions */}
    </div>
  )
}
