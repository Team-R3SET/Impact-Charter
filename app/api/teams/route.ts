import { NextRequest, NextResponse } from "next/server"
import { createTeam, getUserTeams } from "@/lib/team-management"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const teams = await getUserTeams(userId)
    return NextResponse.json({ teams })
  } catch (error) {
    console.error("Failed to fetch teams:", error)
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, ownerId } = body

    if (!name || !ownerId) {
      return NextResponse.json(
        { error: "Team name and owner ID are required" },
        { status: 400 }
      )
    }

    const team = await createTeam({
      name: name.trim(),
      description: description?.trim(),
      ownerId,
    })

    return NextResponse.json({ team })
  } catch (error) {
    console.error("Failed to create team:", error)
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    )
  }
}
