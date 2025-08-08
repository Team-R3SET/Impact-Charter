"use client"

import { useMemo } from "react"
import type { User } from "@/lib/user-types"
import type { TeamMember } from "@/lib/team-types"
import { PermissionChecker, getSystemPermissions, getTeamPermissions } from "@/lib/permissions"

export function usePermissions(user: User | null, teamMember?: TeamMember | null) {
  const checker = useMemo(() => {
    return new PermissionChecker(user, teamMember)
  }, [user, teamMember])

  const systemPermissions = useMemo(() => {
    return user ? getSystemPermissions(user) : null
  }, [user])

  const teamPermissions = useMemo(() => {
    return getTeamPermissions(teamMember)
  }, [teamMember])

  return {
    checker,
    systemPermissions,
    teamPermissions,
    // Convenience methods
    canAccessAdmin: checker.canAccessAdmin(),
    canManageUsers: checker.canManageUsers(),
    canViewLogs: checker.canViewLogs(),
    canInviteToTeam: checker.canInviteToTeam(),
    canManageTeamRoles: checker.canManageTeamRoles(),
    canEditTeamSettings: checker.canEditTeamSettings(),
    canDeleteTeam: checker.canDeleteTeam(),
  }
}

export function usePlanPermissions(
  user: User | null,
  planOwnerId: string,
  teamMember?: TeamMember | null
) {
  const checker = useMemo(() => {
    return new PermissionChecker(user, teamMember)
  }, [user, teamMember])

  return useMemo(() => {
    return {
      canEdit: checker.canEditPlan(planOwnerId),
      canDelete: checker.canDeletePlan(planOwnerId),
      canShare: checker.canSharePlan(planOwnerId),
    }
  }, [checker, planOwnerId])
}
