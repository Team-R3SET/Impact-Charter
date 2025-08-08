export type TeamRole = "owner" | "admin" | "member" | "viewer"

export interface TeamMember {
  id: string
  userId: string
  teamId: string
  role: TeamRole
  joinedDate: string
  invitedBy: string
  status: "active" | "pending" | "inactive"
  permissions: TeamPermissions
}

export interface TeamPermissions {
  canInviteMembers: boolean
  canManageRoles: boolean
  canEditTeamSettings: boolean
  canDeleteTeam: boolean
  canCreatePlans: boolean
  canEditPlans: boolean
  canDeletePlans: boolean
  canViewAnalytics: boolean
}

export interface Team {
  id: string
  name: string
  description?: string
  ownerId: string
  createdDate: string
  lastModified: string
  settings: TeamSettings
  memberCount: number
  planCount: number
  isActive: boolean
}

export interface TeamSettings {
  visibility: "private" | "public" | "organization"
  allowMemberInvites: boolean
  requireApprovalForJoining: boolean
  defaultMemberRole: TeamRole
  planSharingEnabled: boolean
  activityLoggingEnabled: boolean
}

export interface TeamInvitation {
  id: string
  teamId: string
  invitedEmail: string
  invitedBy: string
  role: TeamRole
  status: "pending" | "accepted" | "declined" | "expired"
  createdDate: string
  expiresDate: string
  message?: string
}

export interface TeamActivity {
  id: string
  teamId: string
  userId: string
  userName: string
  action: string
  resource: string
  details?: string
  timestamp: string
}

export const getDefaultPermissions = (role: TeamRole): TeamPermissions => {
  switch (role) {
    case "owner":
      return {
        canInviteMembers: true,
        canManageRoles: true,
        canEditTeamSettings: true,
        canDeleteTeam: true,
        canCreatePlans: true,
        canEditPlans: true,
        canDeletePlans: true,
        canViewAnalytics: true,
      }
    case "admin":
      return {
        canInviteMembers: true,
        canManageRoles: true,
        canEditTeamSettings: true,
        canDeleteTeam: false,
        canCreatePlans: true,
        canEditPlans: true,
        canDeletePlans: true,
        canViewAnalytics: true,
      }
    case "member":
      return {
        canInviteMembers: false,
        canManageRoles: false,
        canEditTeamSettings: false,
        canDeleteTeam: false,
        canCreatePlans: true,
        canEditPlans: true,
        canDeletePlans: false,
        canViewAnalytics: false,
      }
    case "viewer":
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
}

export const canPerformAction = (member: TeamMember, action: keyof TeamPermissions): boolean => {
  return member.permissions[action] && member.status === "active"
}
