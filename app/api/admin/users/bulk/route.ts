import { type NextRequest, NextResponse } from "next/server"
import { bulkUpdateUsers, activateUser, deactivateUser } from "@/lib/user-management"

export async function POST(request: NextRequest) {
  try {
    const { action, userIds, updates } = await request.json()

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const result: any = { success: false, count: 0 }

    switch (action) {
      case "activate":
        for (const userId of userIds) {
          const success = await activateUser(userId)
          if (success) result.count++
        }
        result.success = true
        result.message = `Activated ${result.count} users`
        break

      case "deactivate":
        for (const userId of userIds) {
          const success = await deactivateUser(userId)
          if (success) result.count++
        }
        result.success = true
        result.message = `Deactivated ${result.count} users`
        break

      case "update":
        if (!updates) {
          return NextResponse.json({ error: "Updates required for update action" }, { status: 400 })
        }
        result.count = await bulkUpdateUsers(userIds, updates)
        result.success = true
        result.message = `Updated ${result.count} users`
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error performing bulk action:", error)
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 })
  }
}
