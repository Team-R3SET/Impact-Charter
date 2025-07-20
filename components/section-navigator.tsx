"use client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { BUSINESS_PLAN_SECTIONS } from "@/lib/business-plan-sections"
import { useStorage, useOthers } from "@/lib/liveblocks"
import { CheckCircle, Circle, Edit3, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SectionNavigatorProps {
  activeSection: string
  onSectionChange: (sectionId: string) => void
}

export function SectionNavigator({ activeSection, onSectionChange }: SectionNavigatorProps) {
  const others = useOthers()

  const sections = useStorage((root) => {
    if (!root.sections) return {}

    if (typeof (root.sections as any).get === "function") {
      const map = root.sections as any
      const obj: Record<string, any> = {}
      map.forEach((value: any, key: string) => (obj[key] = value))
      return obj
    }

    return root.sections as Record<string, any>
  })

  const completedSections = useStorage((root) => {
    if (!root.completedSections) return {}

    if (typeof (root.completedSections as any).get === "function") {
      const map = root.completedSections as any
      const obj: Record<string, boolean> = {}
      map.forEach((value: boolean, key: string) => (obj[key] = value))
      return obj
    }

    return root.completedSections as Record<string, boolean>
  }) as Record<string, boolean>

  const getSectionProgress = (sectionId: string) => {
    if (completedSections?.[sectionId]) {
      return true
    }

    const entry = sections?.[sectionId]
    const content = entry?.content ?? ""
    return content.trim().length > 50
  }

  const getUsersInSection = (sectionId: string) => {
    return others.filter(
      (user) => user.presence.selectedSection === sectionId || user.presence.isTyping?.sectionId === sectionId,
    )
  }

  const completedCount = BUSINESS_PLAN_SECTIONS.filter((section) => completedSections?.[section.id] === true).length

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Business Plan Sections</h2>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">
            {completedCount}/{BUSINESS_PLAN_SECTIONS.length} Complete
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {BUSINESS_PLAN_SECTIONS.map((section, index) => {
            const isActive = activeSection === section.id
            const isComplete = getSectionProgress(section.id)
            const usersInSection = getUsersInSection(section.id)
            const typingUsers = usersInSection.filter(
              (user) =>
                user.presence.isTyping?.sectionId === section.id &&
                Date.now() - user.presence.isTyping.timestamp < 3000,
            )

            return (
              <Button
                key={section.id}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start mb-1 h-auto p-3"
                onClick={() => onSectionChange(section.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {completedSections?.[section.id] ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : isComplete ? (
                      <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-medium text-sm truncate flex items-center gap-2">
                        {index + 1}. {section.title}
                        {typingUsers.length > 0 && <Edit3 className="w-3 h-3 text-blue-500 animate-pulse" />}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{section.description}</div>

                      {/* Show users currently in this section */}
                      {usersInSection.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex -space-x-1">
                            {usersInSection.slice(0, 2).map((user) => (
                              <Avatar key={user.connectionId} className="w-4 h-4 border border-background">
                                <AvatarImage
                                  src={user.presence.user?.avatar || "/placeholder.svg"}
                                  alt={user.presence.user?.name}
                                />
                                <AvatarFallback className="text-[8px]">
                                  {user.presence.user?.name?.charAt(0)?.toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          {usersInSection.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">+{usersInSection.length - 2}</span>
                          )}
                        </div>
                      )}
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
