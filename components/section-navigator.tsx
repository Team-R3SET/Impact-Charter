"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const completionPercentage = Math.round((completedSections.size / sections.length) * 100)

  const handleToggleComplete = (sectionId: string, currentlyCompleted: boolean) => {
    if (onToggleComplete) {
      onToggleComplete(sectionId, !currentlyCompleted)
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

          return (
            <div key={section.id} className="group relative">
              <Button
                variant={isCurrent ? "default" : "ghost"}
                className={`w-full justify-start text-left transition-all duration-200 ${
                  isCollapsed ? "h-auto p-2" : "h-auto p-3 pr-10"
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleComplete(section.id, isCompleted)
                      }}
                    >
                      {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
