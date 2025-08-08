"use client"

import { AppHeader } from "@/components/app-header"
import { TeamInvitations } from "@/components/team-invitations"
import { useUser } from "@/contexts/user-context"
import { useRouter } from "next/navigation"

export default function InvitationsPage() {
  const { user } = useUser()
  const router = useRouter()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your invitations.</p>
      </div>
    )
  }

  const handleInvitationAccepted = () => {
    // Redirect to teams page after accepting an invitation
    router.push("/teams")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader currentUser={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Team Invitations</h1>
            <p className="text-muted-foreground">
              Manage your pending team invitations and join new teams
            </p>
          </div>
          <TeamInvitations 
            currentUser={user} 
            onInvitationAccepted={handleInvitationAccepted}
          />
        </div>
      </main>
    </div>
  )
}
