"use client"

import { useEffect, useMemo, useState } from "react"

import { BusinessPlansGrid } from "@/components/business-plans-grid"
import { CreatePlanDialog } from "@/components/create-plan-dialog"
import { PlanCardSkeleton } from "@/components/plan-card-skeleton"
import { PlansEmptyState } from "@/components/plans-empty-state"
import { PlansHeader } from "@/components/plans-header"
import { useUser } from "@/contexts/user-context"
import { useToast } from "@/hooks/use-toast"
import type { BusinessPlan } from "@/lib/airtable"

type SortKey = "planName" | "createdDate" | "status" | "lastModified"
type ViewMode = "grid" | "list"
type StatusFilter = BusinessPlan["status"] | "all"

export default function PlansPage() {
  const { user } = useUser()
  const { toast } = useToast()

  const [plans, setPlans] = useState<BusinessPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)

  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortBy, setSortBy] = useState<SortKey>("lastModified")

  /* ------------------------------------------------------------------ */
  /* Data fetching                                                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!user?.email) {
      setIsLoading(false)
      return
    }

    async function fetchPlans() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/business-plans?userEmail=${encodeURIComponent(user.email)}`)
        const json = await res.json()

        if (!json.success) {
          throw new Error(json.error?.message || "Failed to fetch plans")
        }
        setPlans(Array.isArray(json.data) ? json.data : [])
      } catch (err) {
        console.error(err)
        toast({
          title: "Error loading plans",
          description:
            err instanceof Error ? err.message : "Unable to fetch your business plans. Please try again later.",
          variant: "destructive",
        })
        setPlans([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [user, toast])

  /* ------------------------------------------------------------------ */
  /* CRUD helpers                                                       */
  /* ------------------------------------------------------------------ */
  const handlePlanCreated = (plan: BusinessPlan) => setPlans((prev) => [plan, ...prev])

  const handlePlanUpdate = (id: string, updates: Partial<BusinessPlan>) =>
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))

  const handlePlanDelete = (id: string) => setPlans((prev) => prev.filter((p) => p.id !== id))

  /* ------------------------------------------------------------------ */
  /* Derived list (search + filter + sort)                              */
  /* ------------------------------------------------------------------ */
  const visiblePlans = useMemo(() => {
    return plans
      .filter((p) => {
        const matchesSearch = searchQuery.trim() === "" || p.planName.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" || p.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "planName":
            return a.planName.localeCompare(b.planName)
          case "createdDate":
            return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
          case "status":
            return a.status.localeCompare(b.status)
          default: // lastModified
            return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        }
      })
  }, [plans, searchQuery, statusFilter, sortBy])

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <PlansHeader
          plans={plans}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreatePlan={() => setCreateDialogOpen(true)}
        />

        {isLoading ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            }`}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
        ) : visiblePlans.length > 0 ? (
          <BusinessPlansGrid
            plans={visiblePlans}
            viewMode={viewMode}
            onPlanUpdate={handlePlanUpdate}
            onPlanDelete={handlePlanDelete}
          />
        ) : (
          <PlansEmptyState onCreatePlan={() => setCreateDialogOpen(true)} />
        )}
      </div>

      {user?.email && (
        <CreatePlanDialog
          open={isCreateDialogOpen}
          onOpenChange={setCreateDialogOpen}
          userEmail={user.email}
          onPlanCreated={handlePlanCreated}
        />
      )}
    </>
  )
}
