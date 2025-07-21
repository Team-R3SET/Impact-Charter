"use client"

import { PlanCard } from "./plan-card"
import type { BusinessPlan } from "@/lib/airtable"

interface BusinessPlansGridProps {
  plans: BusinessPlan[]
  viewMode: "grid" | "list"
  onPlanUpdate: (planId: string, updates: Partial<BusinessPlan>) => void
  onPlanDelete: (planId: string) => void
}

export function BusinessPlansGrid({ plans, viewMode, onPlanUpdate, onPlanDelete }: BusinessPlansGridProps) {
  return (
    <div
      className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
    >
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} viewMode={viewMode} onUpdate={onPlanUpdate} onDelete={onPlanDelete} />
      ))}
    </div>
  )
}
