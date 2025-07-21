"use client"

import { useState } from "react"
import { PlanCard } from "./plan-card"
import { PlansEmptyState } from "./plans-empty-state"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { BusinessPlan } from "@/lib/airtable"

interface BusinessPlansGridProps {
  plans: BusinessPlan[]
  viewMode?: "grid" | "list"
  isLoading?: boolean
  onCreatePlan?: () => void
  onRefresh?: () => void
}

export function BusinessPlansGrid({
  plans,
  viewMode = "grid",
  isLoading = false,
  onCreatePlan,
  onRefresh,
}: BusinessPlansGridProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true)
      await onRefresh()
      setRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!plans || plans.length === 0) {
    return <PlansEmptyState onCreatePlan={onCreatePlan} />
  }

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {plans.length} {plans.length === 1 ? "plan" : "plans"} found
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        )}
      </div>

      {/* Plans grid/list */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} viewMode={viewMode} />
        ))}
      </div>
    </div>
  )
}
