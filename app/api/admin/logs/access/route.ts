import { type NextRequest, NextResponse } from "next/server"
import { getAccessLogs } from "@/lib/logging"
import { getCurrentUser, canViewLogs } from "@/lib/user-management"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

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

    const logs = await getAccessLogs(limit, offset)
    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Failed to fetch access logs:", error)
    return NextResponse.json({ error: "Failed to fetch access logs" }, { status: 500 })
  }
}
