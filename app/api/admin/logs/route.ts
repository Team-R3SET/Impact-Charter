import { type NextRequest, NextResponse } from "next/server"
import { getSystemLogs, type LogFilter } from "@/lib/system-logs"
import { getCurrentUser, canViewLogs } from "@/lib/user-management"

export async function GET(request: NextRequest) {
  try {
    // Mock authentication - in a real app, get user from session/token
    const currentUser = await getCurrentUser("admin@example.com")

    if (!currentUser || !canViewLogs(currentUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50", 10)

    // Parse filters
    const filters: LogFilter = {}

    const levelParam = url.searchParams.get("level")
    if (levelParam) {
      filters.level = levelParam.split(",") as any[]
    }

    const categoryParam = url.searchParams.get("category")
    if (categoryParam) {
      filters.category = categoryParam.split(",") as any[]
    }

    const userId = url.searchParams.get("userId")
    if (userId) {
      filters.userId = userId
    }

    const dateFrom = url.searchParams.get("dateFrom")
    if (dateFrom) {
      filters.dateFrom = dateFrom
    }

    const dateTo = url.searchParams.get("dateTo")
    if (dateTo) {
      filters.dateTo = dateTo
    }

    const search = url.searchParams.get("search")
    if (search) {
      filters.search = search
    }

    const result = await getSystemLogs(page, limit, filters)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Error fetching system logs:", error)
    return NextResponse.json({ error: "Failed to fetch system logs" }, { status: 500 })
  }
}
