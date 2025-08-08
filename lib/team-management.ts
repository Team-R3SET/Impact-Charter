import type { Team, TeamMember, TeamInvitation, TeamActivity, TeamRole, TeamSettings } from "./team-types"
import type { User } from "./user-types"
import { getDefaultPermissions } from "./team-types"

// In-memory storage for demo mode
const teams: Team[] = []
const teamMembers: TeamMember[] = []
const teamInvitations: TeamInvitation[] = []
const teamActivities: TeamActivity[] = []

export const createTeam = async (teamData: {
  name: string
  description?: string
  ownerId: string
  settings?: Partial<TeamSettings>
}): Promise<Team> => {
  const defaultSettings: TeamSettings = {
    visibility: "private",
    allowMemberInvites: false,
    requireApprovalForJoining: true,
    defaultMemberRole: "member",
    planSharingEnabled: true,
    activityLoggingEnabled: true,
    ...teamData.settings,
  }

  const newTeam: Team = {
    id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: teamData.name,
    description: teamData.description,
    ownerId: teamData.ownerId,
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    settings: defaultSettings,
    memberCount: 1,
    planCount: 0,
    isActive: true,
  }

  teams.push(newTeam)

  // Add owner as first member
  const ownerMember: TeamMember = {
    id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: teamData.ownerId,
    teamId: newTeam.id,
    role: "owner",
    joinedDate: new Date().toISOString(),
    invitedBy: teamData.ownerId,
    status: "active",
    permissions: getDefaultPermissions("owner"),
  }

  teamMembers.push(ownerMember)

  await logTeamActivity({
    teamId: newTeam.id,
    userId: teamData.ownerId,
    userName: "Team Owner",
    action: "team_created",
    resource: "team",
    details: `Created team "${newTeam.name}"`,
  })

  return newTeam
}

export const getUserTeams = async (userId: string): Promise<Team[]> => {
  const userMemberships = teamMembers.filter(
    (member) => member.userId === userId && member.status === "active"
  )
  
  return teams.filter((team) => 
    userMemberships.some((membership) => membership.teamId === team.id) && team.isActive
  )
}

export const getTeamById = async (teamId: string): Promise<Team | null> => {
  return teams.find((team) => team.id === teamId && team.isActive) || null
}

export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  return teamMembers.filter((member) => member.teamId === teamId && member.status === "active")
}

export const inviteToTeam = async (invitation: {
  teamId: string
  invitedEmail: string
  invitedBy: string
  role: TeamRole
  message?: string
}): Promise<TeamInvitation> => {
  const newInvitation: TeamInvitation = {
    id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    teamId: invitation.teamId,
    invitedEmail: invitation.invitedEmail,
    invitedBy: invitation.invitedBy,
    role: invitation.role,
    status: "pending",
    createdDate: new Date().toISOString(),
    expiresDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    message: invitation.message,
  }

  teamInvitations.push(newInvitation)

  await logTeamActivity({
    teamId: invitation.teamId,
    userId: invitation.invitedBy,
    userName: "Team Member",
    action: "member_invited",
    resource: "invitation",
    details: `Invited ${invitation.invitedEmail} as ${invitation.role}`,
  })

  return newInvitation
}

export const acceptInvitation = async (invitationId: string, userId: string): Promise<TeamMember | null> => {
  const invitation = teamInvitations.find((inv) => inv.id === invitationId && inv.status === "pending")
  if (!invitation) return null

  // Check if invitation is expired
  if (new Date() > new Date(invitation.expiresDate)) {
    invitation.status = "expired"
    return null
  }

  // Create team member
  const newMember: TeamMember = {
    id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    teamId: invitation.teamId,
    role: invitation.role,
    joinedDate: new Date().toISOString(),
    invitedBy: invitation.invitedBy,
    status: "active",
    permissions: getDefaultPermissions(invitation.role),
  }

  teamMembers.push(newMember)
  invitation.status = "accepted"

  // Update team member count
  const team = teams.find((t) => t.id === invitation.teamId)
  if (team) {
    team.memberCount += 1
    team.lastModified = new Date().toISOString()
  }

  await logTeamActivity({
    teamId: invitation.teamId,
    userId,
    userName: "New Member",
    action: "member_joined",
    resource: "membership",
    details: `Joined team as ${invitation.role}`,
  })

  return newMember
}

export const updateMemberRole = async (
  teamId: string,
  memberId: string,
  newRole: TeamRole,
  updatedBy: string
): Promise<TeamMember | null> => {
  const member = teamMembers.find((m) => m.id === memberId && m.teamId === teamId)
  if (!member) return null

  const oldRole = member.role
  member.role = newRole
  member.permissions = getDefaultPermissions(newRole)

  await logTeamActivity({
    teamId,
    userId: updatedBy,
    userName: "Team Admin",
    action: "role_updated",
    resource: "membership",
    details: `Changed member role from ${oldRole} to ${newRole}`,
  })

  return member
}

export const removeTeamMember = async (
  teamId: string,
  memberId: string,
  removedBy: string
): Promise<boolean> => {
  const memberIndex = teamMembers.findIndex((m) => m.id === memberId && m.teamId === teamId)
  if (memberIndex === -1) return false

  const member = teamMembers[memberIndex]
  member.status = "inactive"

  // Update team member count
  const team = teams.find((t) => t.id === teamId)
  if (team) {
    team.memberCount -= 1
    team.lastModified = new Date().toISOString()
  }

  await logTeamActivity({
    teamId,
    userId: removedBy,
    userName: "Team Admin",
    action: "member_removed",
    resource: "membership",
    details: `Removed team member`,
  })

  return true
}

export const getTeamInvitations = async (teamId: string): Promise<TeamInvitation[]> => {
  return teamInvitations.filter((inv) => inv.teamId === teamId)
}

export const getUserInvitations = async (userEmail: string): Promise<TeamInvitation[]> => {
  return teamInvitations.filter(
    (inv) => inv.invitedEmail === userEmail && inv.status === "pending"
  )
}

export const getTeamActivity = async (teamId: string, limit = 50): Promise<TeamActivity[]> => {
  return teamActivities
    .filter((activity) => activity.teamId === teamId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

const logTeamActivity = async (activity: Omit<TeamActivity, "id" | "timestamp">): Promise<void> => {
  const newActivity: TeamActivity = {
    id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...activity,
  }

  teamActivities.push(newActivity)
}

export const updateTeamSettings = async (
  teamId: string,
  settings: Partial<TeamSettings>,
  updatedBy: string
): Promise<Team | null> => {
  const team = teams.find((t) => t.id === teamId)
  if (!team) return null

  team.settings = { ...team.settings, ...settings }
  team.lastModified = new Date().toISOString()

  await logTeamActivity({
    teamId,
    userId: updatedBy,
    userName: "Team Admin",
    action: "settings_updated",
    resource: "team",
    details: "Updated team settings",
  })

  return team
}

export const deleteTeam = async (teamId: string, deletedBy: string): Promise<boolean> => {
  const team = teams.find((t) => t.id === teamId)
  if (!team) return false

  team.isActive = false
  team.lastModified = new Date().toISOString()

  // Deactivate all members
  teamMembers
    .filter((member) => member.teamId === teamId)
    .forEach((member) => {
      member.status = "inactive"
    })

  await logTeamActivity({
    teamId,
    userId: deletedBy,
    userName: "Team Owner",
    action: "team_deleted",
    resource: "team",
    details: `Deleted team "${team.name}"`,
  })

  return true
}
