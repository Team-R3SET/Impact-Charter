"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Mail, Check, X, Clock, Users } from 'lucide-react'
import type { TeamInvitation } from "@/lib/team-types"
import type { User } from "@/lib/user-types"

interface TeamInvitationsProps {
  currentUser: User
  onInvitationAccepted?: () => void
}

export function TeamInvitations({ currentUser, onInvitationAccepted }: TeamInvitationsProps) {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null)

  useEffect(() => {
    loadInvitations()
  }, [currentUser.email])

  const loadInvitations = async () => {
    try {
      const response = await fetch(`/api/invitations?userEmail=${encodeURIComponent(currentUser.email)}`)
      if (response.ok) {
        const data = await response.json()
        setInvitations(data.invitations)
      }
    } catch (error) {
      console.error("Failed to load invitations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptInvitation = async (invitationId: string) => {
    setProcessingInvitation(invitationId)
    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          userId: currentUser.id,
        }),
      })

      if (response.ok) {
        await loadInvitations()
        onInvitationAccepted?.()
        toast({
          title: "Invitation Accepted",
          description: "You have successfully joined the team!",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to accept invitation",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to accept invitation:", error)
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      })
    } finally {
      setProcessingInvitation(null)
    }
  }

  const handleDeclineInvitation = async (invitationId: string) => {
    // For now, we'll just remove it from the local state
    // In a real implementation, you'd want to update the invitation status
    setInvitations(invitations.filter(inv => inv.id !== invitationId))
    toast({
      title: "Invitation Declined",
      description: "You have declined the team invitation.",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isExpired = (expiresDate: string) => {
    return new Date() > new Date(expiresDate)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading invitations...</div>
        </CardContent>
      </Card>
    )
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pending Invitations</h3>
          <p className="text-muted-foreground text-center">
            You don't have any pending team invitations at the moment.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Team Invitations</h2>
        <Badge variant="secondary">{invitations.length}</Badge>
      </div>

      <div className="space-y-4">
        {invitations.map((invitation) => (
          <Card key={invitation.id} className={isExpired(invitation.expiresDate) ? "opacity-60" : ""}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${invitation.teamId}`} />
                    <AvatarFallback>
                      <Users className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Team Invitation</h3>
                      <Badge variant={invitation.role === "admin" ? "destructive" : "default"}>
                        {invitation.role}
                      </Badge>
                      {isExpired(invitation.expiresDate) && (
                        <Badge variant="secondary">Expired</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      You've been invited to join a team as a <strong>{invitation.role}</strong>
                    </p>
                    {invitation.message && (
                      <div className="bg-muted p-3 rounded-lg mb-3">
                        <p className="text-sm italic">"{invitation.message}"</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Invited {formatDate(invitation.createdDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires {formatDate(invitation.expiresDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {!isExpired(invitation.expiresDate) && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      disabled={processingInvitation === invitation.id}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {processingInvitation === invitation.id ? "Accepting..." : "Accept"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeclineInvitation(invitation.id)}
                      disabled={processingInvitation === invitation.id}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
