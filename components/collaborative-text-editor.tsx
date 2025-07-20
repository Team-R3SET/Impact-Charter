"use client"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useMutation, useStorage } from "@/lib/liveblocks"
import { useToast } from "@/hooks/use-toast"

interface CollaborativeTextEditorProps {
  sectionId: string
  placeholder: string
  planId: string
  userEmail: string
}

export function CollaborativeTextEditor({ sectionId, placeholder, planId, userEmail }: CollaborativeTextEditorProps) {
  const [localContent, setLocalContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  const sectionContent = useStorage((root) => root.sections?.[sectionId]?.content || "")

  const updateSection = useMutation(
    ({ storage }, content: string) => {
      const sections = storage.get("sections") || {}
      sections[sectionId] = {
        title: sectionId,
        content,
        lastModified: new Date().toISOString(),
        modifiedBy: userEmail,
      }
      storage.set("sections", sections)
    },
    [sectionId, userEmail],
  )

  // Sync with LiveBlocks storage
  useEffect(() => {
    if (sectionContent !== localContent) {
      setLocalContent(sectionContent)
    }
  }, [sectionContent])

  // Auto-save to Airtable
  const saveToAirtable = async (content: string) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/business-plans/${planId}/sections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionName: sectionId,
          sectionContent: content,
          modifiedBy: userEmail,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Failed to save to Airtable:", error)
      toast({
        title: "Save Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleContentChange = (content: string) => {
    setLocalContent(content)
    updateSection(content)

    // Debounced save to Airtable
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToAirtable(content)
    }, 2000)
  }

  return (
    <div className="relative">
      <Textarea
        value={localContent}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[300px] resize-none"
      />
      {isSaving && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          Saving...
        </div>
      )}
    </div>
  )
}
