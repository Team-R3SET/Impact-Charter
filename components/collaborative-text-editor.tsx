"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/user-context"
import { CheckCircle, Clock, Save, Shield, X } from "lucide-react"
import { businessPlanSections } from "@/lib/business-plan-sections"

interface CollaborativeTextEditorProps {
  sectionId: string
  sectionTitle: string
  planId: string
  currentUser: {
    name: string
    email: string
    avatar: string
  }
  onSectionComplete: (sectionId: string, isComplete: boolean) => void
  onSectionSelect: (sectionId: string) => void
}

export function CollaborativeTextEditor({
  sectionId,
  sectionTitle,
  planId,
  currentUser,
  onSectionComplete,
  onSectionSelect,
}: CollaborativeTextEditorProps) {
  const [content, setContent] = useState("")
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()
  const { currentUser: contextUser } = useUser()

  const storageKey = `section-${planId}-${sectionId}`
  const completedKey = `${storageKey}-completed`

  // Check if current user is admin
  const isAdmin = contextUser?.role === "admin" || contextUser?.role === "super_admin"

  // Load content and completion status
  useEffect(() => {
    const savedContent = localStorage.getItem(storageKey) || ""
    const savedCompleted = localStorage.getItem(completedKey) === "true"

    setContent(savedContent)
    setIsCompleted(savedCompleted)
    setHasUnsavedChanges(false)
  }, [storageKey, completedKey])

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const timeoutId = setTimeout(() => {
      handleSave()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [content, hasUnsavedChanges])

  const handleSave = useCallback(async () => {
    setIsSaving(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      localStorage.setItem(storageKey, content)
      setHasUnsavedChanges(false)

      toast({
        title: "Saved",
        description: "Your changes have been saved automatically.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [content, storageKey, toast])

  const handleContentChange = (value: string) => {
    setContent(value)
    setHasUnsavedChanges(true)
  }

  const handleMarkComplete = async () => {
    if (content.trim().length < 50) {
      toast({
        title: "Section Incomplete",
        description: "Please add at least 50 characters before marking as complete.",
        variant: "destructive",
      })
      return
    }

    const newCompletedState = !isCompleted
    setIsCompleted(newCompletedState)
    localStorage.setItem(completedKey, newCompletedState.toString())
    onSectionComplete(sectionId, newCompletedState)

    toast({
      title: newCompletedState ? "Section Completed" : "Section Marked Incomplete",
      description: newCompletedState
        ? "Great work! This section has been marked as complete."
        : "This section has been marked as incomplete.",
    })
  }

  const handleAdminMarkIncomplete = async () => {
    if (!isAdmin) return

    setIsCompleted(false)
    localStorage.setItem(completedKey, "false")
    onSectionComplete(sectionId, false)

    toast({
      title: "Admin Action",
      description: "Section marked as incomplete by administrator.",
      variant: "default",
    })
  }

  const currentSection = businessPlanSections.find((s) => s.id === sectionId)
  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-600" />
                )}
                {sectionTitle}
              </CardTitle>
              {currentSection && <p className="text-sm text-muted-foreground">{currentSection.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              )}
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Unsaved
                </Badge>
              )}
              {isSaving && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Saving...
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Content ({wordCount} words)</span>
              <span>{content.length} characters</span>
            </div>
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={`Write your ${sectionTitle.toLowerCase()} here...`}
              className="min-h-[400px] resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={!hasUnsavedChanges || isSaving} variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>

              {content.trim().length >= 50 && (
                <Button
                  onClick={handleMarkComplete}
                  variant={isCompleted ? "outline" : "default"}
                  size="sm"
                  className={isCompleted ? "text-orange-600 border-orange-600 hover:bg-orange-50" : ""}
                >
                  {isCompleted ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Mark Incomplete
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </Button>
              )}

              {isAdmin && isCompleted && (
                <Button
                  onClick={handleAdminMarkIncomplete}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin: Mark Incomplete
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              {content.trim().length < 50 && (
                <span className="text-orange-600">{50 - content.trim().length} more characters needed to complete</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Admin Notice:</strong> You have administrative privileges to mark any completed section as
            incomplete, regardless of content requirements. This action will reset the section's completion status.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
