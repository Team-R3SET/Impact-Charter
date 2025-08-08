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
import { X } from 'lucide-react'

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
import { Bold, Italic, Underline, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Undo, Redo, CheckCircle } from 'lucide-react'

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
  isFullscreen?: boolean
}

function EditorContent({ 
  initialContent, 
  placeholder, 
  onContentChange, 
  onSectionComplete, 
  sectionId, 
  isFullscreen,
  isCollaborative,
  othersData 
}: {
  initialContent: string
  placeholder: string
  onContentChange?: (content: string) => void
  onSectionComplete?: () => void
  sectionId: string
  isFullscreen: boolean
  isCollaborative: boolean
  othersData: any[]
}) {
  const [editor] = useLexicalComposerContext()
  const [localContent, setLocalContent] = useState(initialContent)
  const [selectedText, setSelectedText] = useState("")
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const { toast } = useToast()

  const addCommentMutation = useMutation(({ storage }, commentData: any) => {
    let commentsMap = storage.get("comments")
    if (!commentsMap || typeof commentsMap.set !== 'function') {
      commentsMap = new Map()
      storage.set("comments", commentsMap)
    }
    
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    commentsMap.set(commentId, {
      id: commentId,
      text: commentData.text,
      author: commentData.author,
      timestamp: commentData.timestamp,
      position: commentData.position,
      resolved: false,
      replies: []
    })
  }, [])

  const resolveCommentMutation = useMutation(({ storage }, commentId: string) => {
    const commentsMap = storage.get("comments")
    if (commentsMap && typeof commentsMap.get === 'function') {
      const comment = commentsMap.get(commentId)
      if (comment) {
        commentsMap.set(commentId, { ...comment, resolved: true })
      }
    }
  }, [])

  const replyToCommentMutation = useMutation(({ storage }, { commentId, reply }: { commentId: string; reply: any }) => {
    const commentsMap = storage.get("comments")
    if (commentsMap && typeof commentsMap.get === 'function') {
      const comment = commentsMap.get(commentId)
      if (comment) {
        const updatedReplies = [...(comment.replies || []), reply]
        commentsMap.set(commentId, { ...comment, replies: updatedReplies })
      }
    }
  }, [])

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
            
            if (onContentChange) {
              onContentChange(textContent)
            }
          }
        } catch (error) {
          console.error('Error reading editor content:', error)
        }
      })
    } catch (error) {
      console.error('Content change error:', error)
    }
  }, [onContentChange])

  const handleSelectionChange = useCallback((selection: { start: number; end: number; text: string }) => {
    setSelectedText(selection.text)
    setSelectionStart(selection.start)
    setSelectionEnd(selection.end)
  }, [])

  const handleComplete = useCallback(() => {
    if (!localContent || !localContent.trim()) {
      toast({
        title: "Section Incomplete",
        description: "Please add content to this section before marking it complete.",
        variant: "destructive",
      })
      return
    }

    if (onSectionComplete) {
      onSectionComplete()
    }
  }, [localContent, onSectionComplete, toast])

  return (
    <>
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
      
      {/* Mark Complete Button */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          {selectedText && (
            <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              Selected: "{selectedText.length > 20 ? selectedText.substring(0, 20) + '...' : selectedText}"
            </div>
          )}
        </div>
        <Button
          onClick={handleComplete}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Mark Complete
        </Button>
      </div>
    </>
  )
}

export function CollaborativeTextEditor({
  initialContent = "",
  placeholder = "Start writing...",
  onContentChange,
  onSectionComplete,
  sectionId,
  isFullscreen = false,
}: CollaborativeTextEditorProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isCollaborative, setIsCollaborative] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [showCommentsPanel, setShowCommentsPanel] = useState(false)
  const [liveCursors, setLiveCursors] = useState<Array<{ user: any; position: { x: number; y: number } }>>([])
  const [liveSelections, setLiveSelections] = useState<Array<{ user: any; selection: { start: number; end: number } }>>([])
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  let isLiveblocksAvailable = false
  let room = null
  let othersData: any[] = []

  try {
    const roomContext = useContext(RoomContext)
    isLiveblocksAvailable = roomContext !== null
    if (isLiveblocksAvailable) {
      room = useRoom()
      const others = useOthers()
      othersData = others || []
      setIsCollaborative(true)
    }
  } catch (error) {
    console.log('LiveBlocks not available, using local mode')
    isLiveblocksAvailable = false
  }

  useEffect(() => {
    setIsLoading(false)
  }, [])

  return (
    <div className={cn("w-full", isFullscreen && "fixed inset-0 z-50 bg-background")}>
      {isFullscreen && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Full Screen Editor</h2>
          <Button variant="ghost" size="sm" onClick={() => {}}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="relative border rounded-lg bg-background">
        <LexicalComposer initialConfig={editorConfig}>
          <div className="relative">
            <EditorContent
              initialContent={initialContent}
              placeholder={placeholder}
              onContentChange={onContentChange}
              onSectionComplete={onSectionComplete}
              sectionId={sectionId}
              isFullscreen={isFullscreen}
              isCollaborative={isCollaborative}
              othersData={othersData}
            />
          </div>
        </LexicalComposer>
      </div>

      {/* ... existing code for comments panel ... */}
    </div>
  )
}
