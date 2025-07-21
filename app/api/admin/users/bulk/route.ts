import { type NextRequest, NextResponse } from "next/server"
import { bulkUpdateUsers } from "@/lib/user-management"

export async function POST(request: NextRequest) {
  try {
    const { action, userIds } = await request.json()

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    if (!["activate", "deactivate"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updatedCount = await bulkUpdateUsers(userIds, action)

    return NextResponse.json({
      message: `Successfully ${action}d ${updatedCount} user${updatedCount !== 1 ? "s" : ""}`,
      updatedCount,
    })
  } catch (error) {
    console.error("Error performing bulk action:", error)
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 })
  }
}
