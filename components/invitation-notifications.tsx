"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import { Mail, Check, X, Users } from 'lucide-react'
import type { TeamInvitation } from "@/lib/team-types"
import type { User } from "@/lib/user-types"

interface InvitationNotificationsProps {
  currentUser: User
  onInvitationUpdate?: () => void
}

export function InvitationNotifications({ currentUser, onInvitationUpdate }: InvitationNotificationsProps) {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null)

  useEffect(() => {
    loadInvitations()
    // Poll for new invitations every 30 seconds
    const interval = setInterval(loadInvitations, 30000)
    return () => clearInterval(interval)
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
        onInvitationUpdate?.()
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
    setInvitations(invitations.filter(inv => inv.id !== invitationId))
    toast({
      title: "Invitation Declined",
      description: "You have declined the team invitation.",
    })
  }

  const pendingCount = invitations.length

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Mail className="w-4 h-4" />
          {pendingCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {pendingCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Team Invitations</h4>
            {pendingCount > 0 && (
              <Badge variant="secondary">{pendingCount}</Badge>
            )}
          </div>

          {pendingCount === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No pending invitations</p>
            </div>
          ) : (
            <ScrollArea className="max-h-80">
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Team Invitation</p>
                        <p className="text-xs text-muted-foreground">
                          Join as {invitation.role}
                        </p>
                        {invitation.message && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{invitation.message.substring(0, 50)}..."
                          </p>
                        )}
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleAcceptInvitation(invitation.id)}
                            disabled={processingInvitation === invitation.id}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleDeclineInvitation(invitation.id)}
                            disabled={processingInvitation === invitation.id}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
