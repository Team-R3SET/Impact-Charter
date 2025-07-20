"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  CheckCircle,
  Clock,
  Users,
  Target,
  TrendingUp,
  Lightbulb,
  DollarSign,
  BarChart3,
  Settings,
} from "lucide-react"
import { CollaborativeTextEditor } from "@/components/collaborative-text-editor"
import { SectionNavigator } from "@/components/section-navigator"
import { LiveCollabButton } from "@/components/live-collab-button"
import { AppHeader } from "@/components/app-header"
import { businessPlanSections } from "@/lib/business-plan-sections"

interface BusinessPlanEditorProps {
  planId: string
  planName: string
  userEmail: string
  showHeader?: boolean
}

export function BusinessPlanEditor({ planId, planName, userEmail, showHeader = true }: BusinessPlanEditorProps) {
  const [activeSection, setActiveSection] = useState("executive-summary")
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Mock user for demo purposes
  const currentUser = {
    name: "Demo User",
    email: userEmail,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`,
  }

  // Load completed sections
  useEffect(() => {
    const loadCompletedSections = async () => {
      try {
        const response = await fetch(`/api/business-plans/${planId}/sections`)
        if (response.ok) {
          const data = await response.json()
          const completed: Record<string, boolean> = {}
          data.sections?.forEach((section: any) => {
            if (section.isCompleted) {
              completed[section.sectionName] = true
            }
          })
          setCompletedSections(completed)
        }
      } catch (error) {
        console.error("Error loading completed sections:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCompletedSections()
  }, [planId])

  const handleSectionComplete = (sectionName: string, isComplete: boolean) => {
    setCompletedSections((prev) => ({
      ...prev,
      [sectionName]: isComplete,
    }))
  }

  const completedCount = Object.values(completedSections).filter(Boolean).length
  const totalSections = businessPlanSections.length
  const completionPercentage = Math.round((completedCount / totalSections) * 100)

  const currentSectionData = businessPlanSections.find((section) => section.id === activeSection)

  const getSectionIcon = (sectionId: string) => {
    const iconMap: Record<string, any> = {
      "executive-summary": FileText,
      "company-description": Target,
      "market-analysis": TrendingUp,
      "organization-management": Users,
      "products-services": Lightbulb,
      "marketing-sales": BarChart3,
      "funding-request": DollarSign,
      "financial-projections": BarChart3,
      appendix: Settings,
      "implementation-timeline": Clock,
    }
    return iconMap[sectionId] || FileText
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {showHeader && <AppHeader currentUser={currentUser} currentPlanId={planId} />}
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading business plan...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {showHeader && <AppHeader currentUser={currentUser} currentPlanId={planId} />}

      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{planName}</h1>
              <p className="text-gray-600 dark:text-gray-400">Collaborative business plan development workspace</p>
            </div>

            <div className="flex items-center gap-4">
              <LiveCollabButton planId={planId} planName={planName} currentUser={currentUser} />

              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Progress</div>
                <div className="flex items-center gap-2">
                  <Progress value={completionPercentage} className="w-24" />
                  <span className="text-sm font-medium">
                    {completedCount}/{totalSections}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-xl font-bold">{completedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                    <p className="text-xl font-bold">{totalSections - completedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Sections</p>
                    <p className="text-xl font-bold">{totalSections}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completion</p>
                    <p className="text-xl font-bold">{completionPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Navigator */}
          <div className="lg:col-span-1">
            <SectionNavigator
              sections={businessPlanSections}
              activeSection={activeSection}
              completedSections={completedSections}
              onSectionChange={setActiveSection}
            />
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  {currentSectionData && (
                    <>
                      {(() => {
                        const IconComponent = getSectionIcon(currentSectionData.id)
                        return <IconComponent className="w-6 h-6 text-blue-600" />
                      })()}
                      <div className="flex-1">
                        <CardTitle className="text-xl">{currentSectionData.title}</CardTitle>
                        <CardDescription className="mt-1">{currentSectionData.description}</CardDescription>
                      </div>
                      {completedSections[activeSection] && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <CollaborativeTextEditor
                  planId={planId}
                  sectionName={activeSection}
                  userEmail={userEmail}
                  onSectionComplete={handleSectionComplete}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
