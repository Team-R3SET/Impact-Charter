"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CollaborativeTextEditor } from "./collaborative-text-editor"
import { SectionNavigator } from "./section-navigator"
import { LiveCollabButton } from "./live-collab-button"
import { AppHeader } from "./app-header"
import { businessPlanSections } from "@/lib/business-plan-sections"
import { CheckCircle, Clock, FileText } from "lucide-react"

interface BusinessPlanEditorProps {
  planId: string
  planName: string
  userEmail: string
  showHeader?: boolean
}

export function BusinessPlanEditor({ planId, planName, userEmail, showHeader = true }: BusinessPlanEditorProps) {
  const [selectedSection, setSelectedSection] = useState(businessPlanSections[0].id)
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set())
  const [isCollaborative, setIsCollaborative] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const currentUser = {
    name: "Demo User",
    email: userEmail,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`,
  }

  // Check if we're in collaborative mode based on URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setIsCollaborative(urlParams.get("collab") === "true")
  }, [])

  // Load completed sections from localStorage
  useEffect(() => {
    const loadCompletedSections = () => {
      const completed = new Set<string>()
      businessPlanSections.forEach((section) => {
        const isCompleted = localStorage.getItem(`section-${planId}-${section.id}-completed`)
        if (isCompleted === "true") {
          completed.add(section.id)
        }
      })
      setCompletedSections(completed)
    }

    loadCompletedSections()

    // Listen for storage changes to update completion state
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes(`section-${planId}-`) && e.key?.includes("-completed")) {
        loadCompletedSections()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [planId])

  const currentSectionData = businessPlanSections.find((section) => section.id === selectedSection)
  const completionPercentage = Math.round((completedSections.size / businessPlanSections.length) * 100)

  // Handle section completion from the editor
  const handleSectionComplete = useCallback((sectionId: string, isComplete: boolean) => {
    setCompletedSections((prev) => {
      const newSet = new Set(prev)
      if (isComplete) {
        newSet.add(sectionId)
      } else {
        newSet.delete(sectionId)
      }
      return newSet
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showHeader && <AppHeader currentUser={currentUser} currentPlanId={planId} />}

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{planName}</h1>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Business Plan
                </Badge>
                {isCollaborative && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live Collaboration
                  </Badge>
                )}
              </div>
            </div>
            <LiveCollabButton planId={planId} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Progress Overview</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {completedSections.size} of {businessPlanSections.length} sections complete
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Progress value={completionPercentage} className="flex-1" />
                  <span className="text-sm font-medium">{completionPercentage}%</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{completedSections.size} Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span>{businessPlanSections.length - completedSections.size} Remaining</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div
          className={`grid gap-6 transition-all duration-300 ${
            isSidebarCollapsed ? "grid-cols-1 lg:grid-cols-[auto_1fr]" : "grid-cols-1 lg:grid-cols-4"
          }`}
        >
          <div className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:w-auto" : "lg:col-span-1"}`}>
            <SectionNavigator
              sections={businessPlanSections}
              selectedSection={selectedSection}
              onSectionSelect={setSelectedSection}
              completedSections={completedSections}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>

          <div className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:col-span-1" : "lg:col-span-3"}`}>
            {currentSectionData && (
              <CollaborativeTextEditor
                key={selectedSection}
                sectionId={selectedSection}
                sectionTitle={currentSectionData.title}
                planId={planId}
                currentUser={currentUser}
                onSectionComplete={handleSectionComplete}
                onSectionSelect={setSelectedSection}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
