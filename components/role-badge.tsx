"use client"

import { Badge } from "@/components/ui/badge"
import { Crown, Shield, User, Eye, Settings } from 'lucide-react'
import type { TeamRole } from "@/lib/team-types"
import type { UserRole } from "@/lib/user-types"

interface RoleBadgeProps {
  role: TeamRole | UserRole
  size?: "sm" | "default" | "lg"
  showIcon?: boolean
}

export function RoleBadge({ role, size = "default", showIcon = true }: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "owner":
        return {
          label: "Owner",
          variant: "destructive" as const,
          icon: Crown,
          color: "text-yellow-500",
        }
      case "admin":
        return {
          label: "Admin",
          variant: "default" as const,
          icon: Shield,
          color: "text-blue-500",
        }
      case "member":
        return {
          label: "Member",
          variant: "secondary" as const,
          icon: User,
          color: "text-green-500",
        }
      case "viewer":
        return {
          label: "Viewer",
          variant: "outline" as const,
          icon: Eye,
          color: "text-gray-500",
        }
      case "administrator":
        return {
          label: "Administrator",
          variant: "destructive" as const,
          icon: Settings,
          color: "text-red-500",
        }
      case "regular":
        return {
          label: "User",
          variant: "secondary" as const,
          icon: User,
          color: "text-blue-500",
        }
      default:
        return {
          label: role,
          variant: "secondary" as const,
          icon: User,
          color: "text-gray-500",
        }
    }
  }

  const config = getRoleConfig(role)
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={size === "sm" ? "text-xs" : ""}>
      {showIcon && <Icon className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} mr-1 ${config.color}`} />}
      {config.label}
    </Badge>
  )
}
