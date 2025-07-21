"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  MoreHorizontal,
  Edit,
  Copy,
  Share,
  Download,
  Trash2,
  Users,
  Calendar,
  FileText,
  ExternalLink,
} from "lucide-react"
import type { BusinessPlan } from "@/lib/airtable"

interface PlanCardProps {
  plan: BusinessPlan
  viewMode: "grid" | "list"
  onRename?: (planId: string, newName: string) => void
  onDelete?: (planId: string) => void
}

export function PlanCard({ plan, viewMode, onRename, onDelete }: PlanCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Mock data for demo - in real app this would come from props or API
  const progress = Math.floor(Math.random() * 100)
  const collaborators = [
    { name: "John Doe", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john" },
    { name: "Jane Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane" },
  ]

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

  const handleOpen = () => {
    router.push(`/plan/${plan.id}?name=${encodeURIComponent(plan.planName)}`)
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
          description: `"${plan.planName}" has been duplicated successfully.`,
        })
        // Refresh the page to show the new plan
        window.location.reload()
      } else {
        throw new Error("Failed to duplicate plan")
      }
    } catch (error) {
      toast({
        title: "Failed to duplicate",
        description: "There was an error duplicating the plan.",
        variant: "destructive",
      })
    }
  }

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/plan/${plan.id}?collab=true`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link copied",
      description: "Collaboration link copied to clipboard.",
    })
  }

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(plan.id!)
      toast({
        title: "Plan deleted",
        description: `"${plan.planName}" has been deleted.`,
      })
    } catch (error) {
      toast({
        title: "Failed to delete",
        description: "There was an error deleting the plan.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate cursor-pointer hover:text-primary" onClick={handleOpen}>
                    {plan.planName}
                  </h3>
                  <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Modified {formatDate(plan.lastModified)}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {progress}% complete
                  </div>
                  {collaborators.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {collaborators.length} collaborator{collaborators.length === 1 ? "" : "s"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Progress value={progress} className="w-20" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleOpen}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRename?.(plan.id!, plan.planName)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
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
    <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-lg truncate cursor-pointer hover:text-primary group-hover:text-primary transition-colors"
              onClick={handleOpen}
            >
              {plan.planName}
            </h3>
            <Badge className={`${getStatusColor(plan.status)} mt-1`}>{plan.status}</Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpen}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRename?.(plan.id!, plan.planName)}>
                <Edit className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Collaborators */}
        {collaborators.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Collaborators</span>
              <div className="flex -space-x-2">
                {collaborators.slice(0, 3).map((collaborator, index) => (
                  <Avatar key={index} className="w-6 h-6 border-2 border-background">
                    <AvatarImage src={collaborator.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{collaborator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {collaborators.length > 3 && (
                  <div className="w-6 h-6 bg-muted rounded-full border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium">+{collaborators.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Modified {formatDate(plan.lastModified)}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpen}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
          >
            Open Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
