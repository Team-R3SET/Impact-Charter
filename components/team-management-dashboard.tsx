"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Users, Plus, Settings, Activity, Mail, Crown, Shield, User, Eye } from 'lucide-react'
import type { Team, TeamMember, TeamInvitation, TeamActivity } from "@/lib/team-types"
import type { User as UserType } from "@/lib/user-types"

interface TeamManagementDashboardProps {
  currentUser: UserType
}

export function TeamManagementDashboard({ currentUser }: TeamManagementDashboardProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([])
  const [teamActivity, setTeamActivity] = useState<TeamActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showInviteMember, setShowInviteMember] = useState(false)

  const [newTeamData, setNewTeamData] = useState({
    name: "",
    description: "",
  })

  const [inviteData, setInviteData] = useState({
    email: "",
    role: "member" as const,
    message: "",
  })

  useEffect(() => {
    loadUserTeams()
  }, [currentUser.id])

  useEffect(() => {
    if (selectedTeam) {
      loadTeamData(selectedTeam.id)
    }
  }, [selectedTeam])

  const loadUserTeams = async () => {
    try {
      const response = await fetch(`/api/teams?userId=${currentUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams)
        if (data.teams.length > 0 && !selectedTeam) {
          setSelectedTeam(data.teams[0])
        }
      }
    } catch (error) {
      console.error("Failed to load teams:", error)
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadTeamData = async (teamId: string) => {
    try {
      const [membersRes, invitationsRes, activityRes] = await Promise.all([
        fetch(`/api/teams/${teamId}/members`),
        fetch(`/api/teams/${teamId}/invitations`),
        fetch(`/api/teams/${teamId}/activity`),
      ])

      if (membersRes.ok) {
        const membersData = await membersRes.json()
        setTeamMembers(membersData.members)
      }

      if (invitationsRes.ok) {
        const invitationsData = await invitationsRes.json()
        setTeamInvitations(invitationsData.invitations)
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setTeamActivity(activityData.activities)
      }
    } catch (error) {
      console.error("Failed to load team data:", error)
    }
  }

  const handleCreateTeam = async () => {
    if (!newTeamData.name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeamData.name,
          description: newTeamData.description,
          ownerId: currentUser.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTeams([...teams, data.team])
        setSelectedTeam(data.team)
        setNewTeamData({ name: "", description: "" })
        setShowCreateTeam(false)
        toast({
          title: "Success",
          description: "Team created successfully",
        })
      }
    } catch (error) {
      console.error("Failed to create team:", error)
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      })
    }
  }

  const handleInviteMember = async () => {
    if (!inviteData.email.trim() || !selectedTeam) return

    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitedEmail: inviteData.email,
          role: inviteData.role,
          message: inviteData.message,
          invitedBy: currentUser.id,
        }),
      })

      if (response.ok) {
        await loadTeamData(selectedTeam.id)
        setInviteData({ email: "", role: "member", message: "" })
        setShowInviteMember(false)
        toast({
          title: "Success",
          description: "Invitation sent successfully",
        })
      }
    } catch (error) {
      console.error("Failed to send invitation:", error)
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />
      case "member":
        return <User className="w-4 h-4 text-green-500" />
      case "viewer":
        return <Eye className="w-4 h-4 text-gray-500" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading teams...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your teams and collaborate with others</p>
        </div>
        <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>Create a new team to collaborate with others</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={newTeamData.name}
                  onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <Label htmlFor="team-description">Description (Optional)</Label>
                <Textarea
                  id="team-description"
                  value={newTeamData.description}
                  onChange={(e) => setNewTeamData({ ...newTeamData, description: e.target.value })}
                  placeholder="Describe your team's purpose"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam}>Create Team</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first team to start collaborating with others
            </p>
            <Button onClick={() => setShowCreateTeam(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Team List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Your Teams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTeam?.id === team.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <div className="font-medium">{team.name}</div>
                    <div className="text-sm opacity-70">{team.memberCount} members</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Team Details */}
          <div className="lg:col-span-3">
            {selectedTeam && (
              <Tabs defaultValue="members" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
                    {selectedTeam.description && (
                      <p className="text-muted-foreground">{selectedTeam.description}</p>
                    )}
                  </div>
                  <Dialog open={showInviteMember} onOpenChange={setShowInviteMember}>
                    <DialogTrigger asChild>
                      <Button>
                        <Mail className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>Send an invitation to join your team</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="invite-email">Email Address</Label>
                          <Input
                            id="invite-email"
                            type="email"
                            value={inviteData.email}
                            onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="invite-role">Role</Label>
                          <Select
                            value={inviteData.role}
                            onValueChange={(value: any) => setInviteData({ ...inviteData, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="invite-message">Message (Optional)</Label>
                          <Textarea
                            id="invite-message"
                            value={inviteData.message}
                            onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                            placeholder="Add a personal message"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowInviteMember(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleInviteMember}>Send Invitation</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <TabsList>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="invitations">Invitations</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Members ({teamMembers.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`} />
                                <AvatarFallback>
                                  {member.userId.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">Member {member.userId}</div>
                                <div className="text-sm text-muted-foreground">
                                  Joined {new Date(member.joinedDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getRoleIcon(member.role)}
                              <Badge variant={member.role === "owner" ? "destructive" : "default"}>
                                {member.role}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="invitations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Invitations ({teamInvitations.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {teamInvitations.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No pending invitations</p>
                      ) : (
                        <div className="space-y-4">
                          {teamInvitations.map((invitation) => (
                            <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <div className="font-medium">{invitation.invitedEmail}</div>
                                <div className="text-sm text-muted-foreground">
                                  Invited {new Date(invitation.createdDate).toLocaleDateString()} • Expires {new Date(invitation.expiresDate).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge variant={invitation.status === "pending" ? "default" : "secondary"}>
                                {invitation.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {teamActivity.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No recent activity</p>
                      ) : (
                        <div className="space-y-4">
                          {teamActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg">
                              <Activity className="w-5 h-5 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium">{activity.userName}</div>
                                <div className="text-sm text-muted-foreground">{activity.details}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {new Date(activity.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Settings</CardTitle>
                      <CardDescription>Configure your team preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Team Visibility</div>
                            <div className="text-sm text-muted-foreground">
                              Control who can see your team
                            </div>
                          </div>
                          <Badge>{selectedTeam.settings.visibility}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Member Invites</div>
                            <div className="text-sm text-muted-foreground">
                              Allow members to invite others
                            </div>
                          </div>
                          <Badge variant={selectedTeam.settings.allowMemberInvites ? "default" : "secondary"}>
                            {selectedTeam.settings.allowMemberInvites ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Plan Sharing</div>
                            <div className="text-sm text-muted-foreground">
                              Enable sharing plans within the team
                            </div>
                          </div>
                          <Badge variant={selectedTeam.settings.planSharingEnabled ? "default" : "secondary"}>
                            {selectedTeam.settings.planSharingEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
