"use client"

import { Search, Filter, SortAsc, Grid, List, Plus, Download, Upload } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { BusinessPlan } from "@/lib/airtable"

interface PlansHeaderProps {
  plans: BusinessPlan[]
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
  onCreatePlan: () => void
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
  const getStatusCounts = () => {
    const counts = plans.reduce(
      (acc, plan) => {
        acc[plan.status] = (acc[plan.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      all: plans.length,
      ...counts,
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Impact Charters</h1>
        <p className="text-muted-foreground">Create, manage, and collaborate on your impact charters</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search and Filters */}
        <div className="flex flex-1 items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Plans
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.all}
                </Badge>
              </SelectItem>
              <SelectItem value="Draft">
                Draft
                {statusCounts.Draft && (
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts.Draft}
                  </Badge>
                )}
              </SelectItem>
              <SelectItem value="In Progress">
                In Progress
                {statusCounts["In Progress"] && (
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts["In Progress"]}
                  </Badge>
                )}
              </SelectItem>
              <SelectItem value="Complete">
                Complete
                {statusCounts.Complete && (
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts.Complete}
                  </Badge>
                )}
              </SelectItem>
              <SelectItem value="Submitted for Review">
                Submitted for Review
                {statusCounts["Submitted for Review"] && (
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts["Submitted for Review"]}
                  </Badge>
                )}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastModified">Last Modified</SelectItem>
              <SelectItem value="planName">Name</SelectItem>
              <SelectItem value="createdDate">Created Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Plans
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="mr-2 h-4 w-4" />
                Import Plans
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onCreatePlan}>
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary Create Button */}
          <Button onClick={onCreatePlan} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
        </div>
      </div>
    </div>
  )
}
