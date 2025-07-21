"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock } from "lucide-react"
import type { BusinessPlanSection } from "@/lib/business-plan-sections"

interface SectionNavigatorProps {
  sections: BusinessPlanSection[]
  selectedSection: string
  completedSections: Set<string>
  onSectionSelect: (sectionId: string) => void
}

export function SectionNavigator({
  sections,
  selectedSection,
  completedSections,
  onSectionSelect,
}: SectionNavigatorProps) {
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
        {sections.map((section, index) => {
          const isCompleted = completedSections.has(section.id)
          const isCurrent = selectedSection === section.id

          return (
            <Button
              key={section.id}
              variant={isCurrent ? "default" : "ghost"}
              className={`w-full justify-start text-left h-auto p-3 transition-all duration-200 ${
                isCurrent
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : isCompleted
                    ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => onSectionSelect(section.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle className={`w-4 h-4 ${isCurrent ? "text-white" : "text-green-600"}`} />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-white" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium opacity-75">{index + 1}.</span>
                    <div className="font-medium text-sm leading-tight flex-1">{section.title}</div>
                    {isCompleted && !isCurrent && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        ✓
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs opacity-75 mt-1 line-clamp-2 ml-6">{section.description}</div>
                </div>
              </div>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
