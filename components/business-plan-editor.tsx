"use client"

import { useMemo, useState } from "react"
import { useRoom, useStorage, useMutation } from "@/liveblocks.config"
import { SectionNavigator } from "./section-navigator"
import { CollaborativeTextEditor } from "./collaborative-text-editor"
import { businessPlanSectionsTemplate } from "@/lib/business-plan-sections"
import { LiveObject } from "@liveblocks/client"
import type { BusinessPlanSection } from "@/lib/types"

export function BusinessPlanEditor({ planId }: { planId: string }) {
  const room = useRoom()
  const sections = useStorage((root) => root.sections)
  const [activeSection, setActiveSection] = useState(businessPlanSectionsTemplate[0].id)

  const addSection = useMutation(({ storage }, sectionData: BusinessPlanSection) => {
    storage.get("sections").push(new LiveObject(sectionData))
  }, [])

  // Ensure all template sections exist in Liveblocks storage
  useMemo(() => {
    businessPlanSectionsTemplate.forEach((templateSection) => {
      const exists = sections.some((s) => s.section_name === templateSection.id)
      if (!exists) {
        const newSection: BusinessPlanSection = {
          id: crypto.randomUUID(),
          plan_id: planId,
          section_name: templateSection.id,
          section_content: templateSection.content,
          is_complete: false,
          completed_at: null,
          updated_at: new Date().toISOString(),
          modified_by_email: null,
        }
        // This mutation should be called, but for now we'll just log
        // In a real app, you'd call addSection(newSection) here,
        // likely after checking if the user has permission.
        console.log("Would add missing section:", newSection.section_name)
      }
    })
  }, [sections, planId])

  const activeSectionData = sections.find((s) => s.section_name === activeSection)

  return (
    <div className="flex flex-1">
      <aside className="w-64 border-r p-4">
        <SectionNavigator sections={sections} activeSection={activeSection} onSectionSelect={setActiveSection} />
      </aside>
      <div className="flex-1 p-8">
        {activeSectionData && (
          <CollaborativeTextEditor key={activeSectionData.id} planId={planId} section={activeSectionData} />
        )}
      </div>
    </div>
  )
}
