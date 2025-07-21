"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Filter, Grid3X3, List, Download, Upload, MoreHorizontal, SortAsc, SortDesc } from "lucide-react"
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
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Calculate status counts
  const statusCounts = plans.reduce(
    (acc, plan) => {
      acc[plan.status] = (acc[plan.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const handleSortChange = (newSort: string) => {
    if (newSort === sortBy) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      onSortChange(newSort)
      setSortDirection("desc")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Complete":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Submitted for Review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      {/* Title and Primary Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Business Plans</h1>
          <p className="text-muted-foreground">
            {plans.length === 0 ? "No plans yet" : `${plans.length} plan${plans.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Button onClick={onCreatePlan} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Plan
        </Button>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Draft">
                <div className="flex items-center gap-2">
                  Draft
                  {statusCounts.Draft && (
                    <Badge variant="secondary" className="ml-auto">
                      {statusCounts.Draft}
                    </Badge>
                  )}
                </div>
              </SelectItem>
              <SelectItem value="In Progress">
                <div className="flex items-center gap-2">
                  In Progress
                  {statusCounts["In Progress"] && (
                    <Badge variant="secondary" className="ml-auto">
                      {statusCounts["In Progress"]}
                    </Badge>
                  )}
                </div>
              </SelectItem>
              <SelectItem value="Complete">
                <div className="flex items-center gap-2">
                  Complete
                  {statusCounts.Complete && (
                    <Badge variant="secondary" className="ml-auto">
                      {statusCounts.Complete}
                    </Badge>
                  )}
                </div>
              </SelectItem>
              <SelectItem value="Submitted for Review">
                <div className="flex items-center gap-2">
                  Under Review
                  {statusCounts["Submitted for Review"] && (
                    <Badge variant="secondary" className="ml-auto">
                      {statusCounts["Submitted for Review"]}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                {sortDirection === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSortChange("lastModified")}>Last Modified</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("createdDate")}>Created Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("planName")}>Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("status")}>Status</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
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

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Upload className="w-4 h-4 mr-2" />
                Import Plans
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active Filters */}
      {(statusFilter !== "all" || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {statusFilter !== "all" && (
            <Badge
              variant="secondary"
              className={`${getStatusColor(statusFilter)} cursor-pointer`}
              onClick={() => onStatusFilterChange("all")}
            >
              {statusFilter} ×
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => onSearchChange("")}>
              "{searchQuery}" ×
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
