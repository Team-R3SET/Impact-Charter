import { type NextRequest, NextResponse } from "next/server"
import { getAccessLogs } from "@/lib/logging"
import { getCurrentUser, canViewLogs } from "@/lib/user-management"

export async function GET(request: NextRequest) {
  try {
    // Mock authentication - in a real app, get user from session/token
    const currentUser = await getCurrentUser("admin@example.com")

    if (!currentUser || !canViewLogs(currentUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const url = new URL(request.url)
    const limit = url.searchParams.get("limit")
    const limitNumber = limit ? Number.parseInt(limit, 10) : undefined

    const logs = await getAccessLogs(limitNumber)

    return NextResponse.json({
      success: true,
      logs,
      total: logs.length,
    })
  } catch (error) {
    console.error("Error fetching access logs:", error)
    return NextResponse.json({ error: "Failed to fetch access logs" }, { status: 500 })
  }
}
