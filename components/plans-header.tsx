"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Grid, List, Plus, Search } from "lucide-react"
import type { BusinessPlan } from "@/lib/airtable"

interface PlansHeaderProps {
  plans: BusinessPlan[]
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: "all" | "Draft" | "In Progress" | "Complete" | "Submitted for Review"
  onStatusFilterChange: (status: "all" | "Draft" | "In Progress" | "Complete" | "Submitted for Review") => void
  sortBy: "lastModified" | "planName" | "createdDate" | "status"
  onSortChange: (sort: "lastModified" | "planName" | "createdDate" | "status") => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
  onCreatePlan: () => void
}

function getStatusCounts(plans: BusinessPlan[]) {
  return plans.reduce(
    (acc, plan) => {
      acc[plan.status] = (acc[plan.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
}

export function PlansHeader({
  plans,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onCreatePlan,
}: PlansHeaderProps) {
  const statusCounts = getStatusCounts(plans)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Plans</h1>
          <p className="text-muted-foreground">Manage and organize your business plans</p>
        </div>
        <Button onClick={onCreatePlan} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Plan
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Plans
              <Badge variant="secondary" className="ml-2">
                {plans.length}
              </Badge>
            </SelectItem>
            <SelectItem value="Draft">
              Draft
              <Badge variant="secondary" className="ml-2">
                {statusCounts.Draft || 0}
              </Badge>
            </SelectItem>
            <SelectItem value="In Progress">
              In Progress
              <Badge variant="secondary" className="ml-2">
                {statusCounts["In Progress"] || 0}
              </Badge>
            </SelectItem>
            <SelectItem value="Complete">
              Complete
              <Badge variant="secondary" className="ml-2">
                {statusCounts.Complete || 0}
              </Badge>
            </SelectItem>
            <SelectItem value="Submitted for Review">
              Submitted for Review
              <Badge variant="secondary" className="ml-2">
                {statusCounts["Submitted for Review"] || 0}
              </Badge>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastModified">Last Modified</SelectItem>
            <SelectItem value="planName">Plan Name</SelectItem>
            <SelectItem value="createdDate">Created Date</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="rounded-r-none"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="rounded-l-none"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
