"use client"

import { LiveList, LiveObject } from "@liveblocks/client"
import { ClientSideSuspense } from "@liveblocks/react"
import { RoomProvider } from "liveblocks.config"
import type { BusinessPlan, BusinessPlanSection } from "@/lib/types"
import { BusinessPlanEditor } from "./business-plan-editor"
import { LivePresenceHeader } from "./live-presence-header"

interface PlanRoomProps {
  plan: BusinessPlan
  initialSections: BusinessPlanSection[]
}

/**
 * Real-time collaboration wrapper for a single business plan.
 */
export function PlanRoom({ plan, initialSections }: PlanRoomProps) {
  const initialStorage = {
    sections: new LiveList(initialSections.map((s) => new LiveObject<BusinessPlanSection>(s))),
    completedSections: new LiveObject<Record<string, boolean>>({}),
  }

  return (
    <RoomProvider id={plan.id} initialPresence={{ cursor: null }} initialStorage={initialStorage}>
      <ClientSideSuspense fallback={<div className="p-4">Loading …</div>}>
        {() => (
          <div className="flex h-full flex-col">
            <LivePresenceHeader planName={plan.plan_name} />
            <BusinessPlanEditor planId={plan.id} />
          </div>
        )}
      </ClientSideSuspense>
    </RoomProvider>
  )
}
