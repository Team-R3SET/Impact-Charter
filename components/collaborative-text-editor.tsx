"use client"

import React, { useState, useEffect, useCallback, useRef, useContext } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
// Added imports for rich text formatting commands
import { $getSelection, $isRangeSelection, $createParagraphNode, $createTextNode, EditorState } from 'lexical'
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { $createListNode, $createListItemNode, ListItemNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical'
import { Bold, Italic, Underline, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Undo, Redo } from 'lucide-react'

// Replaced dynamic require with proper ES6 imports and error handling
let useRoom: any = null
let useMutation: any = null
let useStorage: any = null
let useSelf: any = null
let useOthers: any = null
let useMyPresence: any = null
let RoomContext: any = null

try {
  // Only import LiveBlocks if available
  const liveblocks = await import("@liveblocks/react").catch(() => null)
  if (liveblocks) {
    useRoom = liveblocks.useRoom
    useMutation = liveblocks.useMutation
    useStorage = liveblocks.useStorage
    useSelf = liveblocks.useSelf
    useOthers = liveblocks.useOthers
    useMyPresence = liveblocks.useMyPresence
    RoomContext = liveblocks.RoomContext
  }
} catch (error) {
  console.log("LiveBlocks not available, using local mode")
}

// Simplified Lexical editor config to avoid version conflicts
const editorConfig = {
  namespace: 'CollaborativeEditor',
  nodes: [
    HeadingNode,
    QuoteNode, // Added QuoteNode for quote formatting
    ListNode,
    ListItemNode,
    AutoLinkNode,
    LinkNode,
  ],
  onError(error: Error) {
    console.error('Lexical error:', error)
  },
  theme: {
    root: 'min-h-[400px] p-4 focus:outline-none',
    paragraph: 'mb-2',
    heading: {
      h1: 'text-2xl font-bold mb-4',
      h2: 'text-xl font-semibold mb-3',
      h3: 'text-lg font-medium mb-2',
    },
    list: {
      nested: {
        listitem: 'list-none',
      },
      ol: 'list-decimal ml-4',
      ul: 'list-disc ml-4',
    },
    listitem: 'mb-1',
    quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4',
  },
}

// Added comprehensive error handling for SelectionPlugin
function SelectionPlugin({ onSelectionChange }: { onSelectionChange: (selection: { start: number; end: number; text: string }) => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor) {
      return
    }

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      if (!editorState) {
        return
      }

      try {
        editorState.read(() => {
          try {
            const selection = $getSelection()
            if (selection && selection.getTextContent) {
              const text = selection.getTextContent()
              if (text) {
                onSelectionChange({
                  start: 0, // Simplified for compatibility
                  end: text.length,
                  text: text
                })
              }
            }
          } catch (error) {
            console.warn('Selection read error:', error)
          }
        })
      } catch (error) {
        console.warn('Selection update error:', error)
      }
    })

    return unregister
  }, [editor, onSelectionChange])

  return null
}

// Added toolbar component for rich text formatting
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const insertHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.insertNodes([$createHeadingNode(headingSize)])
      }
    })
  }

  const insertList = (listType: 'bullet' | 'number') => {
    if (listType === 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    }
  }

  const insertQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.insertNodes([$createQuoteNode()])
      }
    })
  }

  const undo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined)
  }

  const redo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined)
  }

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/50 rounded-t-md">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('bold')}
          className={cn("h-8 w-8 p-0", isBold && "bg-accent")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('italic')}
          className={cn("h-8 w-8 p-0", isItalic && "bg-accent")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('underline')}
          className={cn("h-8 w-8 p-0", isUnderline && "bg-accent")}
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading('h1')}
          className="h-8 w-8 p-0"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading('h2')}
          className="h-8 w-8 p-0"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertHeading('h3')}
          className="h-8 w-8 p-0"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertList('bullet')}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertList('number')}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertQuote}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
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
  // Simplified LiveBlocks context checking
  let roomContext = null
  let isLiveblocksAvailable = false
  
  try {
    if (RoomContext && useContext) {
      roomContext = useContext(RoomContext)
      isLiveblocksAvailable = roomContext !== null
    }
  } catch (error) {
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

  const addCommentMutation = useMutation(({ storage }, commentData: any) => {
    let commentsMap = storage.get("comments")
    if (!commentsMap || typeof commentsMap.set !== 'function') {
      commentsMap = new Map()
      storage.set("comments", commentsMap)
    }
    commentsMap.set(commentData.id, commentData)
  }, [])

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

  // Simplified content change handler with better error handling
  const handleContentChange = useCallback((editorState: EditorState) => {
    if (!editorState) {
      return
    }

    try {
      editorState.read(() => {
        try {
          const root = $getRoot()
          if (root && root.getTextContent) {
            const textContent = root.getTextContent()
            
            setLocalContent(textContent)
            
            if (updateSection) {
              updateSection(textContent)
            }
            
            if (onContentChange) {
              onContentChange(textContent)
            }
            
            // Auto-save functionality
            if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current)
            }
            
            saveTimeoutRef.current = setTimeout(() => {
              setLastSaved(new Date())
              setSaveError(null)
            }, 1000)
          }
        } catch (innerError) {
          console.warn('Error reading editor content:', innerError)
        }
      })
    } catch (error) {
      console.warn('Editor state read error:', error)
    }
  }, [updateSection, onContentChange])

  const handleSelectionChange = useCallback((selection: { start: number; end: number; text: string }) => {
    setSelectedText(selection.text)
    setSelectionStart(selection.start)
    setSelectionEnd(selection.end)
    
    // Update presence with selection
    if (updateMyPresence && selection.text) {
      updateMyPresence({
        user: { name: "Current User", avatar: "" },
        section: sectionId,
        activity: "selecting",
        textSelection: { start: selection.start, end: selection.end, text: selection.text }
      })
    }
  }, [updateMyPresence, sectionId])

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

      if (addCommentMutation) {
        addCommentMutation(newComment)
      }

      setShowCommentsPanel(true)
      toast({
        title: "Comment created",
        description: "Your comment has been added successfully."
      })
    } catch (error) {
      console.error("Failed to create comment:", error)
      toast({
        title: "Error",
        description: "Failed to create comment. Please try again.",
        variant: "destructive"
      })
    }
  }, [isLiveblocksAvailable, room, sectionId, myPresence, selectionStart, selectionEnd, selectedText, toast, addCommentMutation])

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

  const unresolvedCommentsCount = sectionComments?.filter((comment: any) => !comment?.resolved)?.length || 0

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
    if (!localContent || !localContent.trim()) {
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
                <LexicalComposer initialConfig={editorConfig}>
                  <div className="relative">
                    {/* Added toolbar above the editor */}
                    <ToolbarPlugin />
                    <RichTextPlugin
                      contentEditable={
                        <ContentEditable
                          className={cn(
                            "min-h-[400px] resize-none border-0 shadow-none focus:outline-none text-base leading-relaxed p-4 rounded-b-md border border-input bg-background border-t-0",
                            isFullscreen ? "min-h-[60vh]" : ""
                          )}
                          placeholder={placeholder}
                        />
                      }
                      placeholder={
                        <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
                          {placeholder}
                        </div>
                      }
                      ErrorBoundary={LexicalErrorBoundary}
                    />
                    <OnChangePlugin onChange={handleContentChange} />
                    <HistoryPlugin />
                    <SelectionPlugin onSelectionChange={handleSelectionChange} />
                  </div>
                </LexicalComposer>
                
                {/* Live cursors and selections */}
                {liveCursors.map((cursor, index) => (
                  <div key={index} className="absolute pointer-events-none">
                    <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={cursor.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">{cursor.user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      {cursor.user.name}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedText && showControls && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md mt-4">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Selected: "{selectedText?.substring(0, 50)}{(selectedText?.length || 0) > 50 ? '...' : ''}"
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
            </CardContent>
            
            {showControls && (
              <div className="p-6 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isCompleted ? "secondary" : "default"}
                      onClick={handleComplete}
                      disabled={isCompleting || !localContent || !localContent.trim()}
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
              />
            </Panel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
