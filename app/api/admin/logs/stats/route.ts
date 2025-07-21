import { NextResponse } from "next/server"
import { getLogStats } from "@/lib/system-logs"
import { getCurrentUser, canViewLogs } from "@/lib/user-management"

export async function GET() {
  try {
    // Mock authentication - in a real app, get user from session/token
    const currentUser = await getCurrentUser("admin@example.com")

    if (!currentUser || !canViewLogs(currentUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const stats = await getLogStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error fetching log stats:", error)
    return NextResponse.json({ error: "Failed to fetch log stats" }, { status: 500 })
  }
}
