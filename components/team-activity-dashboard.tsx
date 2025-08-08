"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Users, FileText, TrendingUp, Calendar, Clock, UserPlus, Settings, Trash2, Edit, Share, CheckCircle, AlertCircle } from 'lucide-react'
import type { Team, TeamActivity, TeamMember } from "@/lib/team-types"
import type { User } from "@/lib/user-types"

interface TeamActivityDashboardProps {
  team: Team
  currentUser: User
  teamMembers: TeamMember[]
}

interface ActivityStats {
  totalActivities: number
  todayActivities: number
  weekActivities: number
  monthActivities: number
  mostActiveUser: string
  mostCommonAction: string
}

export function TeamActivityDashboard({ team, currentUser, teamMembers }: TeamActivityDashboardProps) {
  const [activities, setActivities] = useState<TeamActivity[]>([])
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "all">("week")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTeamActivity()
  }, [team.id, timeFilter])

  const loadTeamActivity = async () => {
    try {
      const response = await fetch(`/api/teams/${team.id}/activity?limit=100`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
        calculateStats(data.activities)
      }
    } catch (error) {
      console.error("Failed to load team activity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (activities: TeamActivity[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const todayActivities = activities.filter(a => new Date(a.timestamp) >= today).length
    const weekActivities = activities.filter(a => new Date(a.timestamp) >= weekAgo).length
    const monthActivities = activities.filter(a => new Date(a.timestamp) >= monthAgo).length

    // Find most active user
    const userActivityCount = activities.reduce((acc, activity) => {
      acc[activity.userName] = (acc[activity.userName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostActiveUser = Object.entries(userActivityCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A"

    // Find most common action
    const actionCount = activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostCommonAction = Object.entries(actionCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A"

    setStats({
      totalActivities: activities.length,
      todayActivities,
      weekActivities,
      monthActivities,
      mostActiveUser,
      mostCommonAction,
    })
  }

  const getFilteredActivities = () => {
    let filtered = activities

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date()
      let cutoff: Date

      switch (timeFilter) {
        case "today":
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          cutoff = new Date(0)
      }

      filtered = filtered.filter(activity => new Date(activity.timestamp) >= cutoff)
    }

    // Apply action filter
    if (actionFilter !== "all") {
      filtered = filtered.filter(activity => activity.action === actionFilter)
    }

    return filtered
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "team_created":
        return <Users className="w-4 h-4 text-blue-500" />
      case "member_invited":
        return <UserPlus className="w-4 h-4 text-green-500" />
      case "member_joined":
        return <UserPlus className="w-4 h-4 text-green-500" />
      case "member_removed":
        return <Trash2 className="w-4 h-4 text-red-500" />
      case "role_updated":
        return <Settings className="w-4 h-4 text-orange-500" />
      case "settings_updated":
        return <Settings className="w-4 h-4 text-blue-500" />
      case "plan_created":
        return <FileText className="w-4 h-4 text-green-500" />
      case "plan_updated":
        return <Edit className="w-4 h-4 text-blue-500" />
      case "plan_shared":
        return <Share className="w-4 h-4 text-purple-500" />
      case "plan_completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "team_deleted":
        return <Trash2 className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityColor = (action: string) => {
    switch (action) {
      case "team_created":
      case "plan_created":
      case "member_joined":
        return "bg-green-50 border-green-200"
      case "member_removed":
      case "team_deleted":
        return "bg-red-50 border-red-200"
      case "role_updated":
        return "bg-orange-50 border-orange-200"
      case "settings_updated":
      case "plan_updated":
        return "bg-blue-50 border-blue-200"
      case "plan_shared":
        return "bg-purple-50 border-purple-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const uniqueActions = Array.from(new Set(activities.map(a => a.action)))

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading activity data...</div>
        </CardContent>
      </Card>
    )
  }

  const filteredActivities = getFilteredActivities()

  return (
    <div className="space-y-6">
      {/* Activity Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                  <p className="text-2xl font-bold">{stats.totalActivities}</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{stats.weekActivities}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Most Active</p>
                  <p className="text-lg font-semibold truncate">{stats.mostActiveUser}</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Common Action</p>
                  <p className="text-sm font-semibold">{stats.mostCommonAction.replace(/_/g, ' ')}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Activity</CardTitle>
              <CardDescription>Recent actions and events in your team</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Activity Found</h3>
              <p className="text-muted-foreground">
                No activities match your current filters.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${getActivityColor(activity.action)}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{activity.userName}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.action.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.details}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Team Members Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Member Activity Summary</CardTitle>
          <CardDescription>Activity breakdown by team member</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const memberActivities = activities.filter(a => a.userId === member.userId)
              const recentActivity = memberActivities[0]
              
              return (
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
                        {recentActivity 
                          ? `Last active ${formatTimestamp(recentActivity.timestamp)}`
                          : "No recent activity"
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{memberActivities.length}</div>
                    <div className="text-sm text-muted-foreground">activities</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
