import { NextRequest, NextResponse } from "next/server"
import { getTeamActivity } from "@/lib/team-management"

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    const activities = await getTeamActivity(params.teamId, limit)
    return NextResponse.json({ activities })
  } catch (error) {
    console.error("Failed to fetch team activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch team activity" },
      { status: 500 }
    )
  }
}
