"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { PlansHeader } from "@/components/plans-header"
import { PlanCard } from "@/components/plan-card"
import { PlansEmptyState } from "@/components/plans-empty-state"
import { RenamePlanDialog } from "@/components/rename-plan-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { BusinessPlan } from "@/lib/airtable"

interface BusinessPlansGridProps {
  plans: BusinessPlan[]
  isLoading?: boolean
}

export function BusinessPlansGrid({ plans, isLoading = false }: BusinessPlansGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("lastModified")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean
    planId: string
    currentName: string
  }>({
    isOpen: false,
    planId: "",
    currentName: "",
  })
  const router = useRouter()

  // Filter and sort plans
  const filteredAndSortedPlans = useMemo(() => {
    let filtered = [...plans]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (plan) =>
          plan.planName.toLowerCase().includes(query) ||
          plan.ownerEmail.toLowerCase().includes(query) ||
          plan.status.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((plan) => plan.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "planName":
          return a.planName.localeCompare(b.planName)
        case "createdDate":
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        case "status":
          return a.status.localeCompare(b.status)
        case "lastModified":
        default:
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      }
    })

    return filtered
  }, [plans, searchQuery, sortBy, statusFilter])

  const handleRenameClick = (planId: string, currentName: string) => {
    setRenameDialog({
      isOpen: true,
      planId,
      currentName,
    })
  }

  const handleRenameSuccess = (planId: string, newName: string) => {
    // Refresh the page to ensure data consistency
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PlansHeader
        plans={plans}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filteredAndSortedPlans.length === 0 ? (
        <PlansEmptyState hasSearchQuery={!!searchQuery.trim()} searchQuery={searchQuery} />
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredAndSortedPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onRename={handleRenameClick} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Rename Dialog */}
      <RenamePlanDialog
        isOpen={renameDialog.isOpen}
        onClose={() => setRenameDialog({ isOpen: false, planId: "", currentName: "" })}
        planId={renameDialog.planId}
        currentName={renameDialog.currentName}
        onSuccess={(newName) => handleRenameSuccess(renameDialog.planId, newName)}
      />
    </div>
  )
}
