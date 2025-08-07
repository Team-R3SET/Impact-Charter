"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Edit, Copy, Share, Trash2, Calendar, Clock, FileText } from 'lucide-react'
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
import { useToast } from "@/hooks/use-toast"
import type { BusinessPlan } from "@/lib/airtable"

interface PlanCardProps {
  plan: BusinessPlan
  viewMode?: "grid" | "list"
}

export function PlanCard({ plan, viewMode = "grid" }: PlanCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpening, setIsOpening] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Submitted for Review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`

    return formatDate(dateString)
  }

  const handleDuplicate = async () => {
    try {
      const response = await fetch("/api/business-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: `${plan.planName} (Copy)`,
          ownerEmail: plan.ownerEmail,
          status: "Draft",
        }),
      })

      if (response.ok) {
        toast({
          title: "Plan duplicated",
          description: "A copy of your plan has been created.",
        })
        // Refresh the page to show the new plan
        window.location.reload()
      } else {
        throw new Error("Failed to duplicate plan")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate the plan. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/business-plans/${plan.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Plan deleted",
          description: data.airtableWorked 
            ? "The business plan has been deleted from Airtable." 
            : "The business plan has been deleted locally.",
        })
        // Refresh the page
        window.location.reload()
      } else {
        throw new Error(data.error || "Failed to delete plan")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete the plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/plan/${plan.id}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link copied",
      description: "Plan link has been copied to your clipboard.",
    })
  }

  const handleOpenPlan = async () => {
    try {
      setIsOpening(true)
      
      // Verify the plan exists before navigation
      console.log(`[PlanCard] Attempting to open plan: ${plan.id}`)
      const verifyResponse = await fetch(`/api/business-plans/${plan.id}`)
      
      if (!verifyResponse.ok) {
        console.error(`[PlanCard] Plan verification failed: ${verifyResponse.status}`)
        toast({
          title: "Plan not found",
          description: "This plan could not be found. It may have been deleted or moved.",
          variant: "destructive",
        })
        return
      }
      
      const planData = await verifyResponse.json()
      console.log(`[PlanCard] Plan verified successfully:`, planData)
      
      // Add a small delay to ensure data consistency
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Navigate to the plan
      router.push(`/plan/${plan.id}`)
    } catch (error) {
      console.error(`[PlanCard] Error opening plan:`, error)
      toast({
        title: "Error opening plan",
        description: "There was an error opening the plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsOpening(false)
    }
  }

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <button onClick={handleOpenPlan} disabled={isOpening} className="text-left">
                  <h3 className="font-semibold text-lg hover:text-primary transition-colors truncate">
                    {plan.planName}
                  </h3>
                </button>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Created {formatDate(plan.createdDate)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {getTimeAgo(plan.lastModified)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Badge variant="secondary" className={getStatusColor(plan.status)}>
                {plan.status}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleOpenPlan} disabled={isOpening}>
                    <Edit className="mr-2 h-4 w-4" />
                    {isOpening ? "Opening..." : "Edit"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
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
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <button onClick={handleOpenPlan} disabled={isOpening} className="text-left">
                <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                  {plan.planName}
                </h3>
              </button>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenPlan} disabled={isOpening}>
                <Edit className="mr-2 h-4 w-4" />
                {isOpening ? "Opening..." : "Edit"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-3">
          <Badge variant="secondary" className={`w-fit ${getStatusColor(plan.status)}`}>
            {plan.status}
          </Badge>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(plan.createdDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Modified {getTimeAgo(plan.lastModified)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          onClick={handleOpenPlan}
          disabled={isOpening}
        >
          {isOpening ? "Opening..." : "Open Plan"}
        </Button>
      </CardFooter>
    </Card>
  )
}
