"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Maximize2, Minimize2, MessageSquare } from 'lucide-react'
import { businessPlanSections } from "@/lib/business-plan-sections"

interface TextEditorProps {
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
  isFullScreen?: boolean
  onToggleFullScreen?: () => void
}

export function TextEditor({
  sectionId,
  sectionTitle,
  planId,
  currentUser,
  onSectionComplete,
  onSectionSelect,
  isFullScreen = false,
  onToggleFullScreen,
}: TextEditorProps) {
  const [content, setContent] = useState("")
  const [isCompleted, setIsCompleted] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const storageKey = `section-${planId}-${sectionId}`
  const completionKey = `${storageKey}-completed`

  // Load content and completion status from localStorage
  useEffect(() => {
    const savedContent = localStorage.getItem(storageKey) || ""
    const savedCompletion = localStorage.getItem(completionKey) === "true"
    
    setContent(savedContent)
    setIsCompleted(savedCompletion)
    setWordCount(savedContent.trim().split(/\s+/).filter(word => word.length > 0).length)
  }, [storageKey, completionKey])

  // Save content to localStorage
  const saveContent = useCallback((newContent: string) => {
    localStorage.setItem(storageKey, newContent)
    const words = newContent.trim().split(/\s+/).filter(word => word.length > 0).length
    setWordCount(words)
  }, [storageKey])

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    saveContent(newContent)
  }

  // Toggle completion status
  const handleToggleComplete = () => {
    const newCompleted = !isCompleted
    setIsCompleted(newCompleted)
    localStorage.setItem(completionKey, newCompleted.toString())
    onSectionComplete(sectionId, newCompleted)
  }

  // Navigate to next section
  const handleNextSection = () => {
    const currentIndex = businessPlanSections.findIndex(s => s.id === sectionId)
    if (currentIndex < businessPlanSections.length - 1) {
      onSectionSelect(businessPlanSections[currentIndex + 1].id)
    }
  }

  // Navigate to previous section
  const handlePrevSection = () => {
    const currentIndex = businessPlanSections.findIndex(s => s.id === sectionId)
    if (currentIndex > 0) {
      onSectionSelect(businessPlanSections[currentIndex - 1].id)
    }
  }

  const currentSection = businessPlanSections.find(s => s.id === sectionId)
  const currentIndex = businessPlanSections.findIndex(s => s.id === sectionId)

  return (
    <Card className={isFullScreen ? "fixed inset-0 z-50 rounded-none" : ""}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl">{sectionTitle}</CardTitle>
            {isCompleted && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Complete
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onToggleFullScreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFullScreen}
                className="h-8 w-8 p-0"
                title={isFullScreen ? "Exit full screen" : "Enter full screen"}
              >
                {isFullScreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {currentSection?.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {currentSection.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={handleContentChange}
            placeholder={`Start writing your ${sectionTitle.toLowerCase()}...`}
            className={`min-h-[400px] resize-none ${isFullScreen ? "min-h-[60vh]" : ""}`}
          />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{wordCount} words</span>
            <div className="flex items-center gap-4">
              <span>Section {currentIndex + 1} of {businessPlanSections.length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevSection}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextSection}
              disabled={currentIndex === businessPlanSections.length - 1}
            >
              Next
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isCompleted ? "secondary" : "default"}
              size="sm"
              onClick={handleToggleComplete}
              className="flex items-center gap-2"
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Mark Incomplete
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  Mark Complete
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
