"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { TeamActivityDashboard } from "@/components/team-activity-dashboard"
import { useUser } from "@/contexts/user-context"
import { Card, CardContent } from "@/components/ui/card"
import type { Team, TeamMember } from "@/lib/team-types"

export default function TeamActivityPage() {
  const { user } = useUser()
  const params = useParams()
  const teamId = params.teamId as string

  const [team, setTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (teamId) {
      loadTeamData()
    }
  }, [teamId])

  const loadTeamData = async () => {
    try {
      const [teamRes, membersRes] = await Promise.all([
        fetch(`/api/teams/${teamId}`),
        fetch(`/api/teams/${teamId}/members`),
      ])

      if (teamRes.ok) {
        const teamData = await teamRes.json()
        setTeam(teamData.team)
      } else {
        setError("Team not found")
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json()
        setTeamMembers(membersData.members)
      }
    } catch (error) {
      console.error("Failed to load team data:", error)
      setError("Failed to load team data")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view team activity.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppHeader currentUser={user} />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading team activity...</div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppHeader currentUser={user} />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">{error || "Team not found"}</div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader currentUser={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{team.name} - Activity Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor team activity, track engagement, and view detailed analytics
          </p>
        </div>
        <TeamActivityDashboard 
          team={team} 
          currentUser={user} 
          teamMembers={teamMembers}
        />
      </main>
    </div>
  )
}
