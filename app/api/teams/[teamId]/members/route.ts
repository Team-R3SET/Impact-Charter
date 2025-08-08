import { NextRequest, NextResponse } from "next/server"
import { getTeamMembers, removeTeamMember, updateMemberRole } from "@/lib/team-management"

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const members = await getTeamMembers(params.teamId)
    return NextResponse.json({ members })
  } catch (error) {
    console.error("Failed to fetch team members:", error)
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const body = await request.json()
    const { memberId, role, updatedBy } = body

    if (!memberId || !role || !updatedBy) {
      return NextResponse.json(
        { error: "Member ID, role, and updated by user ID are required" },
        { status: 400 }
      )
    }

    const member = await updateMemberRole(params.teamId, memberId, role, updatedBy)
    
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error("Failed to update member role:", error)
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("memberId")
    const removedBy = searchParams.get("removedBy")

    if (!memberId || !removedBy) {
      return NextResponse.json(
        { error: "Member ID and removed by user ID are required" },
        { status: 400 }
      )
    }

    const success = await removeTeamMember(params.teamId, memberId, removedBy)
    
    if (!success) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove team member:", error)
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    )
  }
}
