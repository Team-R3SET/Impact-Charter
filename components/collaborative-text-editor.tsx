"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

// Add these imports at the top
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getNextSection, getPreviousSection } from "@/lib/business-plan-sections"
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
  onSectionComplete?: (sectionId: string, isComplete: boolean) => void
  onSectionSelect?: (sectionId: string) => void
}

const CollaborativeTextEditor: React.FC<CollaborativeTextEditorProps> = ({
  sectionId,
  sectionTitle,
  planId,
  currentUser,
  onSectionComplete,
  onSectionSelect,
}) => {
  const { toast } = useToast()
  const [text, setText] = useState<string>("")
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const updateSection = useMutation(api.businessPlanSections.updateSection)
  const section = useQuery(api.businessPlanSections.getSection, { sectionId: sectionId })

  useEffect(() => {
    if (section) {
      setText(section.content || "")
      setIsComplete(section.isComplete || false)
    }
  }, [section])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleCompleteToggle = async () => {
    setIsSaving(true)
    try {
      await updateSection({
        sectionId: sectionId,
        content: text,
        isComplete: !isComplete,
      })
      setIsComplete(!isComplete)
      onSectionComplete && onSectionComplete(sectionId, !isComplete)
      toast({
        title: isComplete ? "Section marked as incomplete." : "Section marked as complete.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateSection({
        sectionId: sectionId,
        content: text,
        isComplete: isComplete,
      })
      toast({
        title: "Section saved.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!section) {
    return (
      <Card className="w-full h-full p-4 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32" />
        <Skeleton className="h-8 w-1/4" />
      </Card>
    )
  }

  return (
    <Card className="w-full h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{sectionTitle}</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
          <Button
            variant={isComplete ? "secondary" : "outline"}
            size="sm"
            onClick={handleCompleteToggle}
            disabled={isSaving}
          >
            {isComplete ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete
              </>
            ) : (
              "Mark Complete"
            )}
          </Button>
        </div>
      </div>
      <Textarea
        placeholder="Start writing your business plan section here..."
        value={text}
        onChange={handleTextChange}
        ref={textareaRef}
        className="h-96 resize-none"
      />

      {/* Add this section navigation component after the textarea and before the closing </Card> */}
      <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const prevSection = getPreviousSection(sectionId)
            if (prevSection && onSectionSelect) {
              onSectionSelect(prevSection.id)
            }
          }}
          disabled={!getPreviousSection(sectionId)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-xs text-muted-foreground">
          Section {businessPlanSections.findIndex((s) => s.id === sectionId) + 1} of {businessPlanSections.length}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const nextSection = getNextSection(sectionId)
            if (nextSection && onSectionSelect) {
              onSectionSelect(nextSection.id)
            }
          }}
          disabled={!getNextSection(sectionId)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}

export default CollaborativeTextEditor
