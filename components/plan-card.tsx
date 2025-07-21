"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  MoreVertical,
  Edit,
  Copy,
  Share,
  Download,
  Trash2,
  Calendar,
  User,
  Clock,
  Edit3,
  Users,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { BusinessPlan } from "@/lib/airtable"

interface PlanCardProps {
  plan: BusinessPlan
  onRename: (planId: string, currentName: string) => void
  viewMode?: "grid" | "list"
}

export function PlanCard({ plan, onRename, viewMode = "grid" }: PlanCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-green-100 text-green-800 border-green-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Submitted for Review":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getProgressValue = (status: string) => {
    switch (status) {
      case "Complete":
        return 100
      case "In Progress":
        return 65
      case "Submitted for Review":
        return 90
      default:
        return 25
    }
  }

  const mockCollaborators = [
    { name: "John Doe", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john" },
    { name: "Jane Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane" },
  ]

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{plan.planName}</h3>
                  <Badge className={`text-xs ${getStatusColor(plan.status)}`}>{plan.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(new Date(plan.lastModified), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {plan.ownerEmail}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <Progress value={getProgressValue(plan.status)} className="w-20" />
                <span className="text-sm text-muted-foreground">{getProgressValue(plan.status)}%</span>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/plan/${plan.id}?name=${encodeURIComponent(plan.planName)}`}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onRename(plan.id!, plan.planName)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg truncate">{plan.planName}</h3>
            </div>
            <Badge className={`text-xs ${getStatusColor(plan.status)}`}>{plan.status}</Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 transition-opacity ${isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
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
              <DropdownMenuItem onClick={() => onRename(plan.id!, plan.planName)}>
                <Edit3 className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{getProgressValue(plan.status)}%</span>
          </div>
          <Progress value={getProgressValue(plan.status)} className="h-2" />
        </div>

        {/* Collaborators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {mockCollaborators.map((collaborator, index) => (
                <Avatar key={index} className="w-6 h-6 border-2 border-background">
                  <AvatarImage src={collaborator.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {collaborator.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-1" />
            {formatDistanceToNow(new Date(plan.lastModified), { addSuffix: true })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button asChild className="flex-1 bg-transparent" variant="outline">
            <Link href={`/plan/${plan.id}?name=${encodeURIComponent(plan.planName)}`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Plan
            </Link>
          </Button>
          <Button variant="outline" size="icon">
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
