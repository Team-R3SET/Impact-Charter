import { type NextRequest, NextResponse } from "next/server"
import { generateMockLogs, filterLogs, calculateLogStats, type LogFilters } from "@/lib/system-logs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Check if requesting stats only
    if (searchParams.get("stats") === "true") {
      const logs = generateMockLogs(500)
      const stats = calculateLogStats(logs)
      return NextResponse.json(stats)
    }

    // Parse filters
    const filters: LogFilters = {
      search: searchParams.get("search") || undefined,
      levels: searchParams.get("levels")?.split(",").filter(Boolean) || undefined,
      categories: searchParams.get("categories")?.split(",").filter(Boolean) || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      userId: searchParams.get("userId") || undefined,
    }

    // Parse pagination
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    // Generate and filter logs
    const allLogs = generateMockLogs(500)
    const filteredLogs = filterLogs(allLogs, filters)
    const paginatedLogs = filteredLogs.slice(offset, offset + limit)

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
