"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle, Send, Trash2, MoreVertical, Clock, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getBusinessPlanSectionComments,
  addBusinessPlanSectionComment,
  deleteBusinessPlanSectionComment,
  type Comment,
} from "@/lib/airtable-user"
import { CommentSkeleton } from "./comment-skeleton"

interface CommentsPanelProps {
  planId: string
  sectionId: string
  currentUser: {
    name: string
    email: string
    avatar: string
  }
}

export function CommentsPanel({ planId, sectionId, currentUser }: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true)
      try {
        const sectionComments = await getBusinessPlanSectionComments(planId, sectionId)
        setComments(sectionComments)
      } catch (error) {
        console.error("Error loading comments:", error)
        toast({
          title: "Error",
          description: "Failed to load comments.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadComments()
  }, [planId, sectionId, toast])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const result = await addBusinessPlanSectionComment(
        planId,
        sectionId,
        newComment.trim(),
        currentUser.email,
        currentUser.name,
      )

      if (result.success && result.comment) {
        setComments((prev) => [...prev, result.comment!])
        setNewComment("")
        toast({
          title: "Comment Added",
        })
        // Scroll to bottom after adding comment
        setTimeout(() => {
          const viewport = scrollAreaRef.current?.querySelector("div")
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight
          }
        }, 100)
      } else {
        throw new Error(result.error || "Failed to add comment")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const result = await deleteBusinessPlanSectionComment(commentId, currentUser.email)

      if (result.success) {
        setComments((prev) => prev.filter((comment) => comment.id !== commentId))
        toast({
          title: "Comment Deleted",
        })
      } else {
        throw new Error(result.error || "Failed to delete comment")
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5" />
          Comments
          {!isLoading && comments.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {comments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        <ScrollArea className="flex-grow" ref={scrollAreaRef}>
          <div className="pr-4">
            {isLoading ? (
              <div className="space-y-4">
                <CommentSkeleton />
                <CommentSkeleton />
                <CommentSkeleton />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground h-full flex flex-col justify-center items-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs">Be the first to add a comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="group">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                            comment.userEmail || comment.userName
                          }`}
                        />
                        <AvatarFallback className="text-xs">
                          {comment.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{comment.userName}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(comment.createdAt)}
                          </div>

                          {comment.userEmail === currentUser.email && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        <p className="text-sm text-foreground whitespace-pre-wrap break-words">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        <div className="space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Ctrl+Enter to submit</p>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
              className="flex items-center gap-2 w-24"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
