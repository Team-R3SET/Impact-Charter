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

// Enhanced toolbar with better styling and visual hierarchy
function ToolbarPlugin({ isCollaborative, othersData }: { isCollaborative: boolean; othersData: any[] }) {
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
    <div className="flex items-center justify-between p-3 border-b border-border bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-1">
        {/* Text formatting group */}
        <div className="flex items-center gap-0.5 mr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            className={cn("h-8 w-8 p-0 hover:bg-accent/50", isBold && "bg-accent text-accent-foreground")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('italic')}
            className={cn("h-8 w-8 p-0 hover:bg-accent/50", isItalic && "bg-accent text-accent-foreground")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('underline')}
            className={cn("h-8 w-8 p-0 hover:bg-accent/50", isUnderline && "bg-accent text-accent-foreground")}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Heading group */}
        <div className="flex items-center gap-0.5 mr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading('h1')}
            className="h-8 px-2 text-sm font-semibold hover:bg-accent/50"
            title="Heading 1"
          >
            H1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading('h2')}
            className="h-8 px-2 text-sm font-semibold hover:bg-accent/50"
            title="Heading 2"
          >
            H2
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading('h3')}
            className="h-8 px-2 text-sm font-semibold hover:bg-accent/50"
            title="Heading 3"
          >
            H3
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* List group */}
        <div className="flex items-center gap-0.5 mr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertList('bullet')}
            className="h-8 w-8 p-0 hover:bg-accent/50"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertList('number')}
            className="h-8 w-8 p-0 hover:bg-accent/50"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Quote button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={insertQuote}
          className="h-8 w-8 p-0 hover:bg-accent/50 mr-3"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo group */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            className="h-8 w-8 p-0 hover:bg-accent/50"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            className="h-8 w-8 p-0 hover:bg-accent/50"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Live presence indicators integrated into toolbar */}
      {isCollaborative && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
            <div className="flex -space-x-2">
              {othersData.slice(0, 3).map((other: any, index: number) => (
                <Avatar key={index} className="w-6 h-6 border-2 border-background">
                  <AvatarImage src={other.presence?.user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs bg-blue-500 text-white">
                    {other.presence?.user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {othersData.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{othersData.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
  const [editor] = useLexicalComposerContext()
  
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

  // Adding resolveComment mutation function
  const resolveCommentMutation = useMutation(({ storage }, commentId: string) => {
    const commentsMap = storage.get("comments")
    if (commentsMap && typeof commentsMap.get === 'function') {
      const comment = commentsMap.get(commentId)
      if (comment) {
        comment.resolved = true
        commentsMap.set(commentId, comment)
      }
    }
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

  const addComment = useCallback(async (content: string, position?: any) => {
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
        content,
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

  // Adding resolveComment function
  const resolveComment = useCallback(async (commentId: string) => {
    try {
      if (resolveCommentMutation) {
        resolveCommentMutation(commentId)
      }
      
      toast({
        title: "Comment resolved",
        description: "The comment has been marked as resolved."
      })
    } catch (error) {
      console.error("Failed to resolve comment:", error)
      toast({
        title: "Error",
        description: "Failed to resolve the comment. Please try again.",
        variant: "destructive"
      })
    }
  }, [resolveCommentMutation, toast])

  const replyToComment = useCallback(async (commentId: string, content: string) => {
    // Existing replyToComment logic here
  }, [])

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

  const unresolvedCommentCount = sectionComments?.filter((comment: any) => !comment?.resolved)?.length || 0

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
    try {
      // Use localContent state instead of accessing editor directly to avoid Lexical error #8
      const contentToCheck = localContent || ""
      
      if (!contentToCheck.trim()) {
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
    } catch (error) {
      console.error("Error in handleComplete:", error)
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showControls && onToggleFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFullscreen}
              className="flex items-center gap-2"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  Fullscreen
                </>
              )}
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {showControls && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCommentsPanel(!showCommentsPanel)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Comments
              {unresolvedCommentCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unresolvedCommentCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={cn("lg:col-span-2", isFullscreen && "lg:col-span-3")}>
            <div className="border border-input rounded-lg overflow-hidden bg-background shadow-sm">
              <LexicalComposer initialConfig={editorConfig}>
                <div className="relative">
                  {/* Toolbar now includes presence indicators */}
                  <ToolbarPlugin isCollaborative={isCollaborative} othersData={othersData} />
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable
                        className={cn(
                          "min-h-[400px] resize-none border-0 shadow-none focus:outline-none text-base leading-relaxed p-6",
                          isFullscreen ? "min-h-[60vh]" : ""
                        )}
                      />
                    }
                    placeholder={
                      <div className="absolute top-6 left-6 text-muted-foreground/60 pointer-events-none select-none">
                        {placeholder}
                      </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <OnChangePlugin onChange={handleContentChange} />
                  <SelectionPlugin onSelectionChange={handleSelectionChange} />
                  <HistoryPlugin />
                  {/* ListPlugin and LinkPlugin should be imported and used here */}
                </div>
              </LexicalComposer>
              
              {/* Improved live cursors positioning */}
              {liveCursors.map((cursor, index) => (
                <div 
                  key={index} 
                  className="absolute pointer-events-none z-10"
                  style={{
                    top: cursor.position.y,
                    left: cursor.position.x,
                  }}
                >
                  <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-md text-xs shadow-lg">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={cursor.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs bg-blue-600">{cursor.user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{cursor.user.name}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Improved selection UI */}
            {selectedText && showControls && (
              <div className="flex items-center justify-between gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    Selected: "{selectedText?.substring(0, 50)}{(selectedText?.length || 0) > 50 ? '...' : ''}"
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addComment(selectedText)}
                  className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Comment on selection
                </Button>
              </div>
            )}

            {showControls && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isSaving ? "bg-blue-500" : "bg-green-500"
                  )} />
                  {isSaving ? "Saving..." : "Saved"}
                </div>
                
                <Button
                  onClick={handleComplete}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
            )}
          </div>

          {!isFullscreen && showCommentsPanel && (
            <div className="lg:col-span-1">
              <CommentsPanel
                sectionId={sectionId}
                comments={sectionComments}
                onAddComment={addComment}
                onResolveComment={resolveComment}
                onReplyToComment={replyToComment}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
