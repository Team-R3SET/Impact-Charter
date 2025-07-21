"use client"

import { useState, useEffect, useMemo } from "react"
import { PlansHeader } from "@/components/plans-header"
import { BusinessPlansGrid } from "@/components/business-plans-grid"
import { CreatePlanDialog } from "@/components/create-plan-dialog"
import { AppHeader } from "@/components/app-header"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/user-context"
import type { BusinessPlan } from "@/lib/types"
import { redirect } from "next/navigation"

export default function PlansPage() {
  const { user, isLoading: isUserLoading } = useUser()
  const [plans, setPlans] = useState<BusinessPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updated_at")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!isUserLoading && !user) {
      redirect("/login")
    }
  }, [isUserLoading, user])

  const fetchPlans = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const response = await fetch(`/api/business-plans`)
      if (!response.ok) throw new Error("Failed to fetch plans")
      const data = await response.json()
      setPlans(data.plans as BusinessPlan[])
    } catch (error) {
      console.error("Error fetching plans:", error)
      toast({
        title: "Failed to load plans",
        description: "There was an error loading your business plans.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPlans()
    }
  }, [user])

  const filteredAndSortedPlans = useMemo(() => {
    let filtered: BusinessPlan[] = Array.isArray(plans) ? [...plans] : []
    if (searchQuery) {
      filtered = filtered.filter((plan) => plan.plan_name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((plan) => plan.status === statusFilter)
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "plan_name":
          return a.plan_name.localeCompare(b.plan_name)
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "status":
          return (a.status ?? "").localeCompare(b.status ?? "")
        case "updated_at":
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })
    return filtered
  }, [plans, searchQuery, statusFilter, sortBy])

  if (isUserLoading || isLoading) {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Business Plans</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
        <BusinessPlansGrid
          plans={filteredAndSortedPlans}
          viewMode={viewMode}
          onCreatePlan={() => setCreateDialogOpen(true)}
          onRefresh={fetchPlans}
          onPlanUpdate={() => fetchPlans()}
        />
        {user && (
          <CreatePlanDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            ownerId={user.id}
            onPlanCreated={fetchPlans}
          />
        )}
      </div>
    </>
  )
}
