import { type NextRequest, NextResponse } from "next/server"
import { resolveError } from "@/lib/logging"
import { getCurrentUser, canViewLogs } from "@/lib/user-management"

export async function POST(request: NextRequest, { params }: { params: { errorId: string } }) {
  try {
    const body = await request.json()
    const { userEmail } = body

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    const user = await getCurrentUser(userEmail)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!canViewLogs(user)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const success = await resolveError(params.errorId, user.email)
    if (success) {
      return NextResponse.json({ success: true, message: "Error marked as resolved" })
    } else {
      return NextResponse.json({ error: "Error not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Failed to resolve error:", error)
    return NextResponse.json({ error: "Failed to resolve error" }, { status: 500 })
  }
}
