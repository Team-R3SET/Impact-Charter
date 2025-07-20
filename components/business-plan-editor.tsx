"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, FileText } from "lucide-react"
import { CollaborativeTextEditor } from "@/components/collaborative-text-editor"
import { SectionNavigator } from "@/components/section-navigator"
import { AppHeader } from "@/components/app-header"
import { LiveCollabButton } from "@/components/live-collab-button"
import { LivePresenceHeader } from "@/components/live-presence-header"
import { BUSINESS_PLAN_SECTIONS } from "@/lib/business-plan-sections"
import { useToast } from "@/hooks/use-toast"

interface BusinessPlanEditorProps {
  planId: string
  planName: string
  userEmail: string
  showHeader?: boolean
}

export function BusinessPlanEditor({ planId, planName, userEmail, showHeader = true }: BusinessPlanEditorProps) {
  const [currentSectionId, setCurrentSectionId] = useState(BUSINESS_PLAN_SECTIONS[0].id)
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set())
  const [sectionContent, setSectionContent] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // Mock user for demo
  const currentUser = {
    name: "Demo User",
    email: userEmail,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
  }

  const currentSection = BUSINESS_PLAN_SECTIONS.find((section) => section.id === currentSectionId)
  const completionPercentage = Math.round((completedSections.size / BUSINESS_PLAN_SECTIONS.length) * 100)

  const handleSectionComplete = async (sectionId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCompletedSections((prev) => new Set([...prev, sectionId]))

      toast({
        title: "Section Completed! ✅",
        description: `"${BUSINESS_PLAN_SECTIONS.find((s) => s.id === sectionId)?.title}" has been marked as complete and submitted for review.`,
        duration: 4000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark section as complete. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleContentChange = (content: string) => {
    setSectionContent((prev) => ({
      ...prev,
      [currentSectionId]: content,
    }))
  }

  if (!currentSection) {
    return <div>Section not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showHeader && <AppHeader currentUser={currentUser} currentPlanId={planId} />}

      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{planName}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Progress value={completionPercentage} className="w-32" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {completedSections.size}/{BUSINESS_PLAN_SECTIONS.length} Complete
                  </span>
                </div>
                <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                  {completionPercentage}% Complete
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LivePresenceHeader />
              <LiveCollabButton planId={planId} planName={planName} currentUser={currentUser} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Navigator */}
          <div className="lg:col-span-1">
            <SectionNavigator
              sections={BUSINESS_PLAN_SECTIONS}
              currentSectionId={currentSectionId}
              completedSections={completedSections}
              onSectionChange={setCurrentSectionId}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {currentSection.title}
                      {completedSections.has(currentSectionId) && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{currentSection.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!completedSections.has(currentSectionId) && (
                      <Button
                        onClick={() => handleSectionComplete(currentSectionId)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Complete
                      </Button>
                    )}

                    {completedSections.has(currentSectionId) && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <CollaborativeTextEditor
                  planId={planId}
                  sectionId={currentSectionId}
                  placeholder={currentSection.placeholder}
                  initialContent={sectionContent[currentSectionId] || ""}
                  onContentChange={handleContentChange}
                  userEmail={userEmail}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
