"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Check, Reply, MoreVertical, X, Edit3, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

// Conditional LiveBlocks imports
let useStorage: any = null
let useMutation: any = null
let useBroadcastEvent: any = null

try {
  const liveblocks = require("@/lib/liveblocks")
  useStorage = liveblocks.useStorage
  useMutation = liveblocks.useMutation
  useBroadcastEvent = liveblocks.useBroadcastEvent
} catch (error) {
  console.warn("LiveBlocks not available for comments")
}

interface Comment {
  id: string
  sectionId: string
  content: string
  author: {
    name: string
    email: string
    avatar: string
  }
  createdAt: string
  updatedAt?: string
  resolved: boolean
  replies: Array<{
    id: string
    content: string
    author: {
      name: string
      email: string
      avatar: string
    }
    createdAt: string
  }>
  position?: {
    start: number
    end: number
    selectedText?: string
  }
}

interface CommentsPanelProps {
  sectionId: string
  currentUser: {
    name: string
    email: string
    avatar?: string
  }
  isOpen: boolean
  onClose: () => void
}

export function CommentsPanel({ sectionId, currentUser, isOpen, onClose }: CommentsPanelProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // LiveBlocks storage and mutations
  const comments = useStorage ? useStorage((root) => root?.comments || {}) : {}
  const broadcast = useBroadcastEvent ? useBroadcastEvent() : () => {}

  const addComment = useMutation
    ? useMutation(
        ({ storage }, content: string, position?: { start: number; end: number; selectedText?: string }) => {
          if (!storage.get("comments")) {
            storage.set("comments", new Map())
          }

          const commentsMap = storage.get("comments")
          const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          commentsMap.set(commentId, {
            id: commentId,
            sectionId,
            content,
            author: {
              name: currentUser.name,
              email: currentUser.email,
              avatar: currentUser.avatar || "/placeholder.svg",
            },
            createdAt: new Date().toISOString(),
            resolved: false,
            replies: [],
            position,
          })

          return commentId
        },
        [sectionId, currentUser]
      )
    : null

  const addReply = useMutation
    ? useMutation(
        ({ storage }, commentId: string, content: string) => {
          const commentsMap = storage.get("comments")
          if (!commentsMap || !commentsMap.get(commentId)) return

          const comment = commentsMap.get(commentId)
          const replyId = `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          const updatedReplies = [
            ...comment.replies,
            {
              id: replyId,
              content,
              author: {
                name: currentUser.name,
                email: currentUser.email,
                avatar: currentUser.avatar || "/placeholder.svg",
              },
              createdAt: new Date().toISOString(),
            }
          ]

          commentsMap.set(commentId, {
            ...comment,
            replies: updatedReplies,
          })

          return replyId
        },
        [currentUser]
      )
    : null

  const resolveComment = useMutation
    ? useMutation(
        ({ storage }, commentId: string) => {
          const commentsMap = storage.get("comments")
          if (!commentsMap || !commentsMap.get(commentId)) return

          const comment = commentsMap.get(commentId)
          commentsMap.set(commentId, {
            ...comment,
            resolved: !comment.resolved,
          })
        },
        []
      )
    : null

  const deleteComment = useMutation
    ? useMutation(
        ({ storage }, commentId: string) => {
          const commentsMap = storage.get("comments")
          if (!commentsMap) return

          commentsMap.delete(commentId)
        },
        []
      )
    : null

  // Filter comments for current section
  const sectionComments = Object.values(comments || {}).filter(
    (comment: any) => comment.sectionId === sectionId
  ).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !addComment) return

    setIsSubmitting(true)
    try {
      const commentId = addComment(newComment.trim())
      
      // Broadcast comment event
      if (broadcast) {
        broadcast({
          type: "COMMENT_ADDED",
          sectionId,
          userId: currentUser.email,
          commentId,
        })
      }

      setNewComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim() || !addReply) return

    setIsSubmitting(true)
    try {
      const replyId = addReply(commentId, replyContent.trim())
      
      // Broadcast reply event
      if (broadcast) {
        broadcast({
          type: "COMMENT_REPLY",
          sectionId,
          userId: currentUser.email,
          commentId,
          replyId,
        })
      }

      setReplyContent("")
      setReplyingTo(null)
    } catch (error) {
      console.error("Failed to add reply:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolveComment = (commentId: string) => {
    if (!resolveComment) return
    
    resolveComment(commentId)
    
    if (broadcast) {
      broadcast({
        type: "COMMENT_RESOLVED",
        sectionId,
        userId: currentUser.email,
        commentId,
      })
    }
  }

  const handleDeleteComment = (commentId: string) => {
    if (!deleteComment) return
    deleteComment(commentId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-96 bg-background border-l border-border shadow-lg z-40">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">Comments</h3>
          {sectionComments.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {sectionComments.filter((c: any) => !c.resolved).length}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {sectionComments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs">Start a discussion about this section</p>
            </div>
          ) : (
            sectionComments.map((comment: any) => (
              <Card key={comment.id} className={`${comment.resolved ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                        <AvatarFallback className="text-xs">
                          {comment.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{comment.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {comment.resolved && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <Check className="w-3 h-3 mr-1" />
                          Resolved
                        </Badge>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleResolveComment(comment.id)}>
                            <Check className="w-4 h-4 mr-2" />
                            {comment.resolved ? 'Unresolve' : 'Resolve'}
                          </DropdownMenuItem>
                          {comment.author.email === currentUser.email && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm mb-3">{comment.content}</p>
                  
                  {comment.position?.selectedText && (
                    <div className="bg-muted/50 rounded p-2 mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Referenced text:</p>
                      <p className="text-xs italic">"{comment.position.selectedText}"</p>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <Separator />
                      {comment.replies.map((reply: any) => (
                        <div key={reply.id} className="flex gap-2 pl-4 border-l-2 border-muted">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={reply.author.avatar || "/placeholder.svg"} alt={reply.author.name} />
                            <AvatarFallback className="text-xs">
                              {reply.author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-medium">{reply.author.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <p className="text-xs">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply form */}
                  {replyingTo === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyContent.trim() || isSubmitting}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setReplyingTo(comment.id)}
                      className="h-7 px-2 text-xs"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* New comment form */}
      <div className="p-4 border-t">
        <div className="space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <Button 
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Adding..." : "Add Comment"}
          </Button>
        </div>
      </div>
    </div>
  )
}
