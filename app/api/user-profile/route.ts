import { type NextRequest, NextResponse } from "next/server"
import { createOrUpdateUserProfile, getUserProfile } from "@/lib/airtable"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, role, bio, avatar, id } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const profile = await createOrUpdateUserProfile({
      id,
      name: name.trim(),
      email,
      company: company?.trim() || "",
      role: role?.trim() || "",
      bio: bio?.trim() || "",
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      lastModified: new Date().toISOString(),
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Failed to save user profile:", error)
    return NextResponse.json(
      {
        error: "Failed to save user profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const profile = await getUserProfile(email)
    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch user profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
