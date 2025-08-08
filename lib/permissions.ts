import type { User } from "@/lib/user-types"
import type { TeamMember, TeamRole, TeamPermissions } from "@/lib/team-types"

// System-wide permissions based on user role
export interface SystemPermissions {
  canAccessAdmin: boolean
  canManageAllUsers: boolean
  canViewSystemLogs: boolean
  canManageSystemSettings: boolean
  canCreateTeams: boolean
  canViewAllTeams: boolean
}

// Resource-specific permissions
export interface ResourcePermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canShare: boolean
  canManage: boolean
}

export const getSystemPermissions = (user: User): SystemPermissions => {
  const isAdmin = user.role === "administrator"
  
  return {
    canAccessAdmin: isAdmin,
    canManageAllUsers: isAdmin,
    canViewSystemLogs: isAdmin,
    canManageSystemSettings: isAdmin,
    canCreateTeams: true, // All users can create teams
    canViewAllTeams: isAdmin,
  }
}

export const getTeamPermissions = (member: TeamMember | null): TeamPermissions => {
  if (!member || member.status !== "active") {
    return {
      canInviteMembers: false,
      canManageRoles: false,
      canEditTeamSettings: false,
      canDeleteTeam: false,
      canCreatePlans: false,
      canEditPlans: false,
      canDeletePlans: false,
      canViewAnalytics: false,
    }
  }

  return member.permissions
}

export const getPlanPermissions = (
  user: User,
  planOwnerId: string,
  teamMember?: TeamMember | null
): ResourcePermissions => {
  const isOwner = user.id === planOwnerId
  const isAdmin = user.role === "administrator"
  const teamPerms = teamMember ? getTeamPermissions(teamMember) : null

  return {
    canView: true, // Basic viewing is always allowed for team members
    canEdit: isOwner || isAdmin || (teamPerms?.canEditPlans ?? false),
    canDelete: isOwner || isAdmin || (teamPerms?.canDeletePlans ?? false),
    canShare: isOwner || isAdmin || (teamPerms?.canEditPlans ?? false),
    canManage: isOwner || isAdmin,
  }
}

export const canPerformTeamAction = (
  member: TeamMember | null,
  action: keyof TeamPermissions
): boolean => {
  if (!member || member.status !== "active") {
    return false
  }
  return member.permissions[action]
}

export const canPerformSystemAction = (
  user: User | null,
  action: keyof SystemPermissions
): boolean => {
  if (!user || !user.isActive) {
    return false
  }
  const permissions = getSystemPermissions(user)
  return permissions[action]
}

// Permission checking utilities
export class PermissionChecker {
  constructor(
    private user: User | null,
    private teamMember?: TeamMember | null
  ) {}

  // System-level checks
  canAccessAdmin(): boolean {
    return canPerformSystemAction(this.user, "canAccessAdmin")
  }

  canManageUsers(): boolean {
    return canPerformSystemAction(this.user, "canManageAllUsers")
  }

  canViewLogs(): boolean {
    return canPerformSystemAction(this.user, "canViewSystemLogs")
  }

  // Team-level checks
  canInviteToTeam(): boolean {
    return canPerformTeamAction(this.teamMember, "canInviteMembers")
  }

  canManageTeamRoles(): boolean {
    return canPerformTeamAction(this.teamMember, "canManageRoles")
  }

  canEditTeamSettings(): boolean {
    return canPerformTeamAction(this.teamMember, "canEditTeamSettings")
  }

  canDeleteTeam(): boolean {
    return canPerformTeamAction(this.teamMember, "canDeleteTeam")
  }

  // Plan-level checks
  canEditPlan(planOwnerId: string): boolean {
    const permissions = getPlanPermissions(this.user!, planOwnerId, this.teamMember)
    return permissions.canEdit
  }

  canDeletePlan(planOwnerId: string): boolean {
    const permissions = getPlanPermissions(this.user!, planOwnerId, this.teamMember)
    return permissions.canDelete
  }

  canSharePlan(planOwnerId: string): boolean {
    const permissions = getPlanPermissions(this.user!, planOwnerId, this.teamMember)
    return permissions.canShare
  }
}

// Higher-order component for permission-based rendering
export const withPermissions = <T extends object>(
  Component: React.ComponentType<T>,
  requiredPermission: (checker: PermissionChecker) => boolean
) => {
  return (props: T & { user: User; teamMember?: TeamMember }) => {
    const { user, teamMember, ...componentProps } = props
    const checker = new PermissionChecker(user, teamMember)
    
    if (!requiredPermission(checker)) {
      return null
    }
    
    return <Component {...(componentProps as T)} />
  }
}
