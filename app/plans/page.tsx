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
import type { BusinessPlan } from "@/lib/airtable"

export default function PlansPage() {
  const [plans, setPlans] = useState<BusinessPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("lastModified")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  // Mock user - replace with real auth
  const currentUser = {
    name: "Demo User",
    email: "user@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
  }

  const fetchPlans = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/business-plans?owner=${encodeURIComponent(currentUser.email)}`)

      if (!response.ok) throw new Error("Failed to fetch plans")

      // 🔑 Coerce whatever the backend returns into a plain array
      const json = await response.json()
      const parsed = Array.isArray(json) ? json : Array.isArray(json?.plans) ? json.plans : []

      setPlans(parsed as BusinessPlan[])
    } catch (error) {
      console.error("Error fetching plans:", error)
      toast({
        title: "Failed to load plans",
        description: "There was an error loading your business plans. Using local data.",
        variant: "destructive",
      })
      setPlans([]) // fallback array
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanUpdate = (planId: string, updates: Partial<BusinessPlan>) => {
    setPlans((prevPlans) => prevPlans.map((plan) => (plan.id === planId ? { ...plan, ...updates } : plan)))
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  // Filter and sort plans
  const filteredAndSortedPlans = useMemo(() => {
    // ✅ Always work with an array
    let filtered: BusinessPlan[] = Array.isArray(plans) ? [...plans] : []

    if (searchQuery) {
      filtered = filtered.filter((plan) => plan.planName.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((plan) => plan.status === statusFilter)
    }

    // Safe to call .sort now
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
  }, [plans, searchQuery, statusFilter, sortBy])

  if (isLoading) {
    return (
      <>
        <AppHeader currentUser={currentUser} />
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
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
      <AppHeader currentUser={currentUser} />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumb */}
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

        {/* Header with filters and controls */}
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

        {/* Plans Grid */}
        <BusinessPlansGrid
          plans={filteredAndSortedPlans}
          viewMode={viewMode}
          onCreatePlan={() => setCreateDialogOpen(true)}
          onRefresh={fetchPlans}
          onPlanUpdate={handlePlanUpdate}
        />

        {/* Create Plan Dialog */}
        <CreatePlanDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} userEmail={currentUser.email} />
      </div>
    </>
  )
}
