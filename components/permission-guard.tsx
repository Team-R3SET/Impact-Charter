"use client"

import type { ReactNode } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock } from 'lucide-react'
import type { User } from "@/lib/user-types"
import type { TeamMember } from "@/lib/team-types"
import { PermissionChecker } from "@/lib/permissions"

interface PermissionGuardProps {
  user: User | null
  teamMember?: TeamMember | null
  requiredPermission: (checker: PermissionChecker) => boolean
  children: ReactNode
  fallback?: ReactNode
  showError?: boolean
  errorMessage?: string
}

export function PermissionGuard({
  user,
  teamMember,
  requiredPermission,
  children,
  fallback,
  showError = false,
  errorMessage = "You don't have permission to access this feature.",
}: PermissionGuardProps) {
  const checker = new PermissionChecker(user, teamMember)
  const hasPermission = requiredPermission(checker)

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showError) {
      return (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return <>{children}</>
}

// Specific permission guards for common use cases
interface AdminGuardProps {
  user: User | null
  children: ReactNode
  fallback?: ReactNode
  showError?: boolean
}

export function AdminGuard({ user, children, fallback, showError = false }: AdminGuardProps) {
  return (
    <PermissionGuard
      user={user}
      requiredPermission={(checker) => checker.canAccessAdmin()}
      fallback={fallback}
      showError={showError}
      errorMessage="Administrator access required."
    >
      {children}
    </PermissionGuard>
  )
}

interface TeamAdminGuardProps {
  user: User | null
  teamMember?: TeamMember | null
  children: ReactNode
  fallback?: ReactNode
  showError?: boolean
}

export function TeamAdminGuard({ 
  user, 
  teamMember, 
  children, 
  fallback, 
  showError = false 
}: TeamAdminGuardProps) {
  return (
    <PermissionGuard
      user={user}
      teamMember={teamMember}
      requiredPermission={(checker) => checker.canManageTeamRoles()}
      fallback={fallback}
      showError={showError}
      errorMessage="Team admin permissions required."
    >
      {children}
    </PermissionGuard>
  )
}

interface PlanOwnerGuardProps {
  user: User | null
  teamMember?: TeamMember | null
  planOwnerId: string
  children: ReactNode
  fallback?: ReactNode
  showError?: boolean
  action?: "edit" | "delete" | "share"
}

export function PlanOwnerGuard({ 
  user, 
  teamMember, 
  planOwnerId, 
  children, 
  fallback, 
  showError = false,
  action = "edit"
}: PlanOwnerGuardProps) {
  const getPermissionCheck = (action: string) => {
    switch (action) {
      case "delete":
        return (checker: PermissionChecker) => checker.canDeletePlan(planOwnerId)
      case "share":
        return (checker: PermissionChecker) => checker.canSharePlan(planOwnerId)
      default:
        return (checker: PermissionChecker) => checker.canEditPlan(planOwnerId)
    }
  }

  return (
    <PermissionGuard
      user={user}
      teamMember={teamMember}
      requiredPermission={getPermissionCheck(action)}
      fallback={fallback}
      showError={showError}
      errorMessage={`You don't have permission to ${action} this plan.`}
    >
      {children}
    </PermissionGuard>
  )
}
