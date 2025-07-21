"use client"

import { RoomProvider } from "@/liveblocks.config"
import { LiveList, LiveObject } from "@liveblocks/client"
import { ClientSideSuspense } from "@liveblocks/react"
import type { BusinessPlan, BusinessPlanSection } from "@/lib/types"
import { BusinessPlanEditor } from "./business-plan-editor"
import { LivePresenceHeader } from "./live-presence-header"

interface PlanRoomProps {
  plan: BusinessPlan
  initialSections: BusinessPlanSection[]
}

export function PlanRoom({ plan, initialSections }: PlanRoomProps) {
  const initialStorage = {
    sections: new LiveList(initialSections.map((s) => new LiveObject(s))),
  }

  return (
    <RoomProvider id={plan.id} initialPresence={{ cursor: null }} initialStorage={initialStorage}>
      <ClientSideSuspense fallback={<div>Loading...</div>}>
        {() => (
          <div className="flex flex-col h-full">
            <LivePresenceHeader planName={plan.plan_name} />
            <BusinessPlanEditor planId={plan.id} />
          </div>
        )}
      </ClientSideSuspense>
    </RoomProvider>
  )
}
