"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Plus, Search, MoreVertical, Edit, Trash2, Copy, Calendar, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { BusinessPlan } from "@/lib/airtable"

interface BusinessPlansGridProps {
  plans: BusinessPlan[]
}

export function BusinessPlansGrid({ plans }: BusinessPlansGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPlans, setFilteredPlans] = useState(plans)
  const router = useRouter()

  // Filter plans based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = plans.filter((plan) => plan.planName.toLowerCase().includes(query.toLowerCase()))
    setFilteredPlans(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-green-500 hover:bg-green-600"
      case "In Progress":
        return "bg-blue-500 hover:bg-blue-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Complete":
        return "default"
      case "In Progress":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search business plans..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild>
          <Link href="/">
            <Plus className="w-4 h-4 mr-2" />
            New Business Plan
          </Link>
        </Button>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{searchQuery ? "No plans found" : "No business plans yet"}</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try adjusting your search terms" : "Create your first business plan to get started"}
          </p>
          {!searchQuery && (
            <Button asChild>
              <Link href="/">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Plan
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{plan.planName}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getStatusVariant(plan.status)}>{plan.status}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/plan/${plan.id}?name=${encodeURIComponent(plan.planName)}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Plan
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Updated {formatDistanceToNow(new Date(plan.lastModified), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-2" />
                    <span className="truncate">{plan.ownerEmail}</span>
                  </div>
                  <Button asChild className="w-full bg-transparent" variant="outline">
                    <Link href={`/plan/${plan.id}?name=${encodeURIComponent(plan.planName)}`}>
                      <FileText className="w-4 h-4 mr-2" />
                      Open Plan
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
