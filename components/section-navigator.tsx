"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, MoreHorizontal, ChevronUp, ChevronDown, Check, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import type { BusinessPlanSection } from "@/lib/business-plan-sections"

interface SectionNavigatorProps {
  sections: BusinessPlanSection[]
  selectedSection: string
  completedSections: Set<string>
  onSectionSelect: (sectionId: string) => void
  onToggleComplete?: (sectionId: string, isComplete: boolean) => void
}

export function SectionNavigator({
  sections,
  selectedSection,
  completedSections,
  onSectionSelect,
  onToggleComplete,
}: SectionNavigatorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const completionPercentage = Math.round((completedSections.size / sections.length) * 100)

  const handleToggleComplete = async (sectionId: string, currentlyCompleted: boolean) => {
    if (!onToggleComplete) return

    const newCompletionState = !currentlyCompleted
    
    // Add to loading state
    setLoadingSections(prev => new Set(prev).add(sectionId))

    try {
      // Call the parent handler
      onToggleComplete(sectionId, newCompletionState)
      
      // Show success feedback
      toast({
        title: newCompletionState ? "Section completed" : "Section marked incomplete",
        description: `${sections.find(s => s.id === sectionId)?.title} has been ${newCompletionState ? 'completed' : 'marked as incomplete'}.`,
        duration: 3000,
      })
    } catch (error) {
      console.error('Error toggling section completion:', error)
      toast({
        title: "Error",
        description: "Failed to update section status. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Remove from loading state
      setLoadingSections(prev => {
        const newSet = new Set(prev)
        newSet.delete(sectionId)
        return newSet
      })
    }
  }

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Impact Charter Sections</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isCollapsed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {completedSections.size}/{sections.length} Complete
              </span>
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>{completionPercentage}%</Badge>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        {sections.map((section, index) => {
          const isCompleted = completedSections.has(section.id)
          const isCurrent = selectedSection === section.id
          const isLoading = loadingSections.has(section.id)

          return (
            <div key={section.id} className="group relative">
              <Button
                variant={isCurrent ? "default" : "ghost"}
                className={`w-full justify-start text-left transition-all duration-200 ${
                  isCollapsed ? "h-auto p-2" : "h-auto p-3 pr-16"
                } ${
                  isCurrent
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : isCompleted
                      ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => onSectionSelect(section.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted ? (
                      <CheckCircle className={`w-5 h-5 ${isCurrent ? "text-white" : "text-green-600"}`} />
                    ) : isCurrent ? (
                      <Clock className="w-5 h-5 text-white" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                    )}
                  </div>
                  {isCollapsed ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium opacity-75">{index + 1}.</span>
                      {isCompleted && <Check className="w-3 h-3" />}
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium opacity-75">{index + 1}.</span>
                        <div className="font-medium text-sm leading-tight flex-1">{section.title}</div>
                      </div>
                      <div className="text-xs opacity-75 line-clamp-2 ml-6">{section.description}</div>
                    </div>
                  )}
                </div>
              </Button>
              
              {!isCollapsed && onToggleComplete && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {/* Primary toggle button */}
                  <Button
                    variant={isCompleted ? "default" : "outline"}
                    size="sm"
                    className={`h-7 w-7 p-0 transition-all duration-200 ${
                      isCompleted 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "border-gray-300 hover:border-green-500 hover:bg-green-50"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : "opacity-0 group-hover:opacity-100"}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isLoading) {
                        handleToggleComplete(section.id, isCompleted)
                      }
                    }}
                    disabled={isLoading}
                    title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {isLoading ? (
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isCompleted ? (
                      <X className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </Button>
                  
                  {/* Secondary dropdown menu for additional options */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isLoading) {
                            handleToggleComplete(section.id, isCompleted)
                          }
                        }}
                        disabled={isLoading}
                      >
                        {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
