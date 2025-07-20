"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SectionNavigator } from "./section-navigator"
import { CollaborativeTextEditor } from "./collaborative-text-editor"
import { PresenceIndicator } from "./presence-indicator"
import { BUSINESS_PLAN_SECTIONS } from "@/lib/business-plan-sections"
import { MessageSquare, Save } from "lucide-react"

interface BusinessPlanEditorProps {
  planId: string
  planName: string
  userEmail: string
  showHeader?: boolean
}

export function BusinessPlanEditor({ planId, planName, userEmail, showHeader = true }: BusinessPlanEditorProps) {
  const [activeSection, setActiveSection] = useState(BUSINESS_PLAN_SECTIONS[0].id)

  const currentSection = BUSINESS_PLAN_SECTIONS.find((section) => section.id === activeSection)

  if (!currentSection) {
    return <div>Section not found</div>
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header - only show if showHeader is true */}
      {showHeader && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-2xl font-bold">{planName}</h1>
              <p className="text-sm text-muted-foreground">Business Plan</p>
            </div>
            <div className="flex items-center gap-4">
              <PresenceIndicator />
              <Badge variant="outline" className="gap-1">
                <Save className="w-3 h-3" />
                Auto-saving
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <SectionNavigator activeSection={activeSection} onSectionChange={setActiveSection} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto p-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{currentSection.title}</CardTitle>
                      <CardDescription className="mt-2">{currentSection.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <MessageSquare className="w-4 h-4" />
                      Comments
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CollaborativeTextEditor
                    sectionId={activeSection}
                    placeholder={currentSection.placeholder}
                    planId={planId}
                    userEmail={userEmail}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
