import { NextRequest, NextResponse } from "next/server"
import { getTeamById, updateTeamSettings, deleteTeam } from "@/lib/team-management"

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const team = await getTeamById(params.teamId)
    
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error("Failed to fetch team:", error)
    return NextResponse.json(
      { error: "Failed to fetch team" },
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
    const { settings, updatedBy } = body

    if (!updatedBy) {
      return NextResponse.json(
        { error: "Updated by user ID is required" },
        { status: 400 }
      )
    }

    const team = await updateTeamSettings(params.teamId, settings, updatedBy)
    
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error("Failed to update team:", error)
    return NextResponse.json(
      { error: "Failed to update team" },
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
    const deletedBy = searchParams.get("deletedBy")

    if (!deletedBy) {
      return NextResponse.json(
        { error: "Deleted by user ID is required" },
        { status: 400 }
      )
    }

    const success = await deleteTeam(params.teamId, deletedBy)
    
    if (!success) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete team:", error)
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    )
  }
}
