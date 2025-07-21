"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, MoreHorizontal, Edit, Trash2, Copy } from "lucide-react"
import type { BusinessPlan } from "@/lib/airtable"

interface PlanCardProps {
  plan: BusinessPlan
  viewMode: "grid" | "list"
  onUpdate: (planId: string, updates: Partial<BusinessPlan>) => void
  onDelete: (planId: string) => void
}

function getStatusColor(status: string) {
  switch (status) {
    case "Draft":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    case "In Progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "Complete":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "Submitted for Review":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

export function PlanCard({ plan, viewMode, onUpdate, onDelete }: PlanCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this business plan?")) {
      return
    }

    setIsDeleting(true)
    try {
      // In a real app, you'd call an API to delete the plan
      onDelete(plan.id)
    } catch (error) {
      console.error("Error deleting plan:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    router.push(`/plan/${plan.id}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{plan.planName}</h3>
                {plan.description && <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Created {formatDate(plan.createdDate)}</span>
                  <span>Modified {formatDate(plan.lastModified)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
              <Button onClick={handleEdit} variant="outline" size="sm">
                Open
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleEdit}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit()
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <h3 className="font-semibold text-lg mb-2">{plan.planName}</h3>
        {plan.description && <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{plan.description}</p>}
        <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
      </CardContent>
      <CardFooter className="pt-3 text-sm text-muted-foreground">
        <div className="flex justify-between w-full">
          <span>Created {formatDate(plan.createdDate)}</span>
          <span>Modified {formatDate(plan.lastModified)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
