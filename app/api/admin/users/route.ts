import { type NextRequest, NextResponse } from "next/server"
import { getAllUsers, createUser, getUserStats } from "@/lib/user-management"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Check if requesting stats
    if (searchParams.get("stats") === "true") {
      const stats = await getUserStats()
      return NextResponse.json(stats)
    }

    // Get all users
    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // Validate required fields
    if (!userData.name || !userData.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const newUser = await createUser(userData)
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
