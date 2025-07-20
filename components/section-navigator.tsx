"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, FileText } from "lucide-react"
import type { BusinessPlanSection } from "@/lib/business-plan-sections"

interface SectionNavigatorProps {
  sections: BusinessPlanSection[]
  /* the currently-open section */
  selectedSection: string
  /* set of completed section IDs */
  completedSections: Set<string>
  /* callback fired when the user picks a new section */
  onSectionSelect: (sectionId: string) => void
}

export function SectionNavigator({
  sections,
  selectedSection,
  completedSections,
  onSectionSelect,
}: SectionNavigatorProps) {
  // Fallback: if a parent still passes `onSectionChange`, use it.
  const handleSelect = onSectionSelect ?? null

  const completionPercentage = Math.round((completedSections.size / sections.length) * 100)

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Business Plan Sections</CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {completedSections.size}/{sections.length} Complete
            </span>
            <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>{completionPercentage}%</Badge>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sections.map((section) => {
          const isCompleted = completedSections.has(section.id)
          const isCurrent = selectedSection === section.id

          return (
            <Button
              key={section.id}
              variant={isCurrent ? "default" : "ghost"}
              className={`w-full justify-start text-left h-auto p-3 ${
                isCurrent ? "bg-blue-600 text-white" : ""
              } ${isCompleted && !isCurrent ? "bg-green-50 text-green-700 hover:bg-green-100" : ""}`}
              onClick={() => handleSelect(section.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm leading-tight">{section.title}</div>
                  <div className="text-xs opacity-75 mt-1 line-clamp-2">{section.description}</div>
                </div>
              </div>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
