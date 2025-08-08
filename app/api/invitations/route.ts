import { NextRequest, NextResponse } from "next/server"
import { getUserInvitations, acceptInvitation } from "@/lib/team-management"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    const invitations = await getUserInvitations(userEmail)
    return NextResponse.json({ invitations })
  } catch (error) {
    console.error("Failed to fetch user invitations:", error)
    return NextResponse.json(
      { error: "Failed to fetch user invitations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invitationId, userId } = body

    if (!invitationId || !userId) {
      return NextResponse.json(
        { error: "Invitation ID and user ID are required" },
        { status: 400 }
      )
    }

    const member = await acceptInvitation(invitationId, userId)
    
    if (!member) {
      return NextResponse.json(
        { error: "Invitation not found or expired" },
        { status: 404 }
      )
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error("Failed to accept invitation:", error)
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    )
  }
}
