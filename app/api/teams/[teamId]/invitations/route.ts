import { NextRequest, NextResponse } from "next/server"
import { getTeamInvitations, inviteToTeam } from "@/lib/team-management"

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const invitations = await getTeamInvitations(params.teamId)
    return NextResponse.json({ invitations })
  } catch (error) {
    console.error("Failed to fetch team invitations:", error)
    return NextResponse.json(
      { error: "Failed to fetch team invitations" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const body = await request.json()
    const { invitedEmail, role, message, invitedBy } = body

    if (!invitedEmail || !role || !invitedBy) {
      return NextResponse.json(
        { error: "Invited email, role, and invited by user ID are required" },
        { status: 400 }
      )
    }

    const invitation = await inviteToTeam({
      teamId: params.teamId,
      invitedEmail: invitedEmail.trim(),
      role,
      message: message?.trim(),
      invitedBy,
    })

    return NextResponse.json({ invitation })
  } catch (error) {
    console.error("Failed to send invitation:", error)
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    )
  }
}
