"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CollaborativeTextEditor } from "./collaborative-text-editor"
import { TextEditor } from "./text-editor"
import { SectionNavigator } from "./section-navigator"
import { LiveCollabButton } from "./live-collab-button"
import { AppHeader } from "./app-header"
import { businessPlanSections } from "@/lib/business-plan-sections"
import { CheckCircle, Clock, FileText, ChevronUp, ChevronDown, Edit2, Check, X } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface BusinessPlanEditorProps {
  planId: string
  planName: string
  userEmail: string
  showHeader?: boolean
  forceCollaborative?: boolean
}

export function BusinessPlanEditor({ 
  planId, 
  planName, 
  userEmail, 
  showHeader = true,
  forceCollaborative = false 
}: BusinessPlanEditorProps) {
  const [selectedSection, setSelectedSection] = useState(businessPlanSections[0].id)
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set())
  const [isCollaborative, setIsCollaborative] = useState(forceCollaborative)
  const [showProgressOverview, setShowProgressOverview] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  // Added state for inline rename functionality
  const [isRenaming, setIsRenaming] = useState(false)
  const [editedName, setEditedName] = useState(planName)
  const [currentPlanName, setCurrentPlanName] = useState(planName)
  const { toast } = useToast()

  const currentUser = {
    name: "Demo User",
    email: userEmail,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`,
  }

  // Check if we're in collaborative mode based on URL or forced mode
  useEffect(() => {
    if (forceCollaborative) {
      setIsCollaborative(true)
    } else {
      const urlParams = new URLSearchParams(window.location.search)
      setIsCollaborative(urlParams.get("collab") === "true")
    }
  }, [forceCollaborative])

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

  // Update local plan name when prop changes
  useEffect(() => {
    setCurrentPlanName(planName)
    setEditedName(planName)
  }, [planName])

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

  // Added toggle completion handler for section navigator
  const handleToggleComplete = useCallback((sectionId: string, isComplete: boolean) => {
    // Update localStorage
    localStorage.setItem(`section-${planId}-${sectionId}-completed`, isComplete.toString())
    
    // Update state
    setCompletedSections((prev) => {
      const newSet = new Set(prev)
      if (isComplete) {
        newSet.add(sectionId)
      } else {
        newSet.delete(sectionId)
      }
      return newSet
    })

    // Call API to update completion status
    const updateCompletion = async () => {
      try {
        const endpoint = isComplete 
          ? `/api/business-plans/${planId}/sections/${sectionId}/complete`
          : `/api/business-plans/${planId}/sections/${sectionId}/incomplete`
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            completedBy: currentUser.email,
            completedAt: new Date().toISOString(),
          }),
        })

        if (!response.ok) {
          console.warn(`Failed to update section completion status: ${response.status}`)
        }
      } catch (error) {
        console.warn('Error updating section completion:', error)
      }
    }

    updateCompletion()
  }, [planId, currentUser.email])

  // Added full-screen toggle handler
  const handleToggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen)
  }, [isFullScreen])

  // Added rename functionality
  const handleStartRename = () => {
    setIsRenaming(true)
    setEditedName(currentPlanName)
  }

  const handleSaveRename = async () => {
    if (!editedName.trim() || editedName.trim() === currentPlanName) {
      setIsRenaming(false)
      setEditedName(currentPlanName)
      return
    }

    try {
      const response = await fetch(`/api/business-plans/${planId}/rename`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: editedName.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setCurrentPlanName(data.planName)
        setEditedName(data.planName)
        setIsRenaming(false)
        toast({
          title: "Charter renamed",
          description: data.message || "Charter has been successfully renamed.",
        })
        
        // Update the page title
        document.title = `${data.planName} - Business Plan Builder`
      } else {
        throw new Error(data.error || 'Failed to rename charter')
      }
    } catch (error) {
      console.error('Error renaming charter:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rename charter. Please try again.",
        variant: "destructive",
      })
      setEditedName(currentPlanName)
      setIsRenaming(false)
    }
  }

  const handleCancelRename = () => {
    setIsRenaming(false)
    setEditedName(currentPlanName)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename()
    } else if (e.key === 'Escape') {
      handleCancelRename()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showHeader && !isFullScreen && <AppHeader currentUser={currentUser} currentPlanId={planId} />}

      <div className="container mx-auto px-4 py-6">
        {!isFullScreen && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                {/* Added inline rename functionality to the title */}
                <div className="flex items-center gap-3 mb-2">
                  {isRenaming ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="text-3xl font-bold h-12 text-gray-900 dark:text-gray-100 bg-transparent border-2 border-blue-500 focus:border-blue-600"
                        autoFocus
                        onBlur={handleSaveRename}
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveRename}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelRename}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{currentPlanName}</h1>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStartRename}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Rename charter"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
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
          </div>
        )}

        <div className={`grid gap-6 ${isFullScreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4"}`}>
          {/* Hide sidebar in full-screen mode */}
          {!isFullScreen && (
            <div className="lg:col-span-1">
              <SectionNavigator
                sections={businessPlanSections}
                selectedSection={selectedSection}
                onSectionSelect={setSelectedSection}
                completedSections={completedSections}
                onToggleComplete={handleToggleComplete}
              />
            </div>
          )}

          <div className={`space-y-6 ${isFullScreen ? "col-span-1" : "lg:col-span-3"}`}>
            {currentSectionData && (
              // Always use CollaborativeTextEditor when LiveBlocks context is available
              <CollaborativeTextEditor
                key={selectedSection}
                sectionId={selectedSection}
                sectionTitle={currentSectionData.title}
                planId={planId}
                currentUser={currentUser}
                onSectionComplete={handleSectionComplete}
                onSectionSelect={setSelectedSection}
                isFullScreen={isFullScreen}
                onToggleFullScreen={handleToggleFullScreen}
              />
            )}

            {/* Hide progress overview in full-screen mode */}
            {!isFullScreen && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Progress Overview</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowProgressOverview(!showProgressOverview)}
                      className="h-8 w-8 p-0"
                    >
                      {showProgressOverview ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {showProgressOverview && (
                    <div className="text-sm text-muted-foreground">
                      {completedSections.size} of {businessPlanSections.length} sections complete
                    </div>
                  )}
                </CardHeader>
                {showProgressOverview && (
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
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
