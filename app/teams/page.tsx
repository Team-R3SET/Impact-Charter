"use client"

import { AppHeader } from "@/components/app-header"
import { TeamManagementDashboard } from "@/components/team-management-dashboard"
import { useUser } from "@/contexts/user-context"

export default function TeamsPage() {
  const { user } = useUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to access team management.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader currentUser={user} />
      <main className="container mx-auto px-4 py-8">
        <TeamManagementDashboard currentUser={user} />
      </main>
    </div>
  )
}
