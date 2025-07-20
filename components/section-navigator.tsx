"use client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { BUSINESS_PLAN_SECTIONS } from "@/lib/business-plan-sections"
import { useStorage } from "@/lib/liveblocks"
import { CheckCircle, Circle } from "lucide-react"

interface SectionNavigatorProps {
  activeSection: string
  onSectionChange: (sectionId: string) => void
}

export function SectionNavigator({ activeSection, onSectionChange }: SectionNavigatorProps) {
  const sections = useStorage((root) => {
    // root.sections is either:
    //   • undefined  (when not yet created)
    //   • a plain object (our initialStorage fallback)
    //   • a LiveMap   (when other users have written)
    // Convert everything to a POJO so downstream code never hits null.
    if (!root.sections) return {}

    // LiveMap API
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    if (typeof (root.sections as any).get === "function") {
      const map = root.sections as any
      const obj: Record<string, any> = {}
      map.forEach((value: any, key: string) => (obj[key] = value))
      return obj
    }

    // Already a plain object
    return root.sections as Record<string, any>
  })

  const getSectionProgress = (sectionId: string) => {
    const entry = sections?.[sectionId]
    const content = entry?.content ?? ""
    return content.trim().length > 50
  }

  const completedSections = BUSINESS_PLAN_SECTIONS.filter((section) => getSectionProgress(section.id)).length

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Business Plan Sections</h2>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">
            {completedSections}/{BUSINESS_PLAN_SECTIONS.length} Complete
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {BUSINESS_PLAN_SECTIONS.map((section, index) => {
            const isActive = activeSection === section.id
            const isComplete = getSectionProgress(section.id)

            return (
              <Button
                key={section.id}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start mb-1 h-auto p-3"
                onClick={() => onSectionChange(section.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">
                        {index + 1}. {section.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{section.description}</div>
                    </div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
