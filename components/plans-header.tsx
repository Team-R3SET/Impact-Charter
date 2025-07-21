"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreatePlanDialog } from "@/components/create-plan-dialog"
import { Plus, Search, Filter, Grid3X3, List, SortAsc, Download, Upload, MoreHorizontal } from "lucide-react"
import type { BusinessPlan } from "@/lib/airtable"

interface PlansHeaderProps {
  plans: BusinessPlan[]
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

export function PlansHeader({
  plans,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
}: PlansHeaderProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const getStatusCounts = () => {
    const counts = {
      all: plans.length,
      Draft: plans.filter((p) => p.status === "Draft").length,
      "In Progress": plans.filter((p) => p.status === "In Progress").length,
      Complete: plans.filter((p) => p.status === "Complete").length,
    }
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <>
      <div className="space-y-6">
        {/* Title and Primary Action */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Business Plans</h1>
            <p className="text-muted-foreground mt-1">
              {plans.length === 0
                ? "No business plans yet"
                : `${plans.length} ${plans.length === 1 ? "plan" : "plans"} total`}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Status
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts.all}
                  </Badge>
                </SelectItem>
                <SelectItem value="Draft">
                  Draft
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts.Draft}
                  </Badge>
                </SelectItem>
                <SelectItem value="In Progress">
                  In Progress
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts["In Progress"]}
                  </Badge>
                </SelectItem>
                <SelectItem value="Complete">
                  Complete
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts.Complete}
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[140px]">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastModified">Last Modified</SelectItem>
                <SelectItem value="planName">Name</SelectItem>
                <SelectItem value="createdDate">Created Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

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
          </div>
        </div>
      </div>

      <CreatePlanDialog isOpen={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
    </>
  )
}
