import { type NextRequest, NextResponse } from "next/server"
import { resolveError } from "@/lib/logging"
import { getCurrentUser, canViewLogs } from "@/lib/user-management"

export async function POST(request: NextRequest, { params }: { params: { errorId: string } }) {
  try {
    const currentUser = await getCurrentUser("admin@example.com")

    if (!currentUser || !canViewLogs(currentUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { resolvedBy } = await request.json()
    const success = await resolveError(params.errorId, resolvedBy)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Error marked as resolved",
      })
    } else {
      return NextResponse.json({ error: "Error not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error resolving error log:", error)
    return NextResponse.json({ error: "Failed to resolve error" }, { status: 500 })
  }
}
