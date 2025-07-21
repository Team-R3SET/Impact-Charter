import { type NextRequest, NextResponse } from "next/server"
import { generateMockLogs, filterLogs, type LogFilters } from "@/lib/system-logs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse filters (same as main logs endpoint)
    const filters: LogFilters = {
      search: searchParams.get("search") || undefined,
      levels: searchParams.get("levels")?.split(",").filter(Boolean) || undefined,
      categories: searchParams.get("categories")?.split(",").filter(Boolean) || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      userId: searchParams.get("userId") || undefined,
    }

    const format = searchParams.get("format") || "csv"

    // Generate and filter logs
    const allLogs = generateMockLogs(500)
    const filteredLogs = filterLogs(allLogs, filters)

    if (format === "csv") {
      const csvHeaders = [
        "Timestamp",
        "Level",
        "Category",
        "Message",
        "Details",
        "User Email",
        "IP Address",
        "Request ID",
        "Duration (ms)",
      ]

      const csvRows = filteredLogs.map((log) => [
        log.timestamp.toISOString(),
        log.level,
        log.category,
        `"${log.message.replace(/"/g, '""')}"`,
        log.details ? `"${log.details.replace(/"/g, '""')}"` : "",
        log.userEmail || "",
        log.ipAddress || "",
        log.requestId || "",
        log.duration?.toString() || "",
      ])

      const csvContent = [csvHeaders.join(","), ...csvRows.map((row) => row.join(","))].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="system-logs-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else if (format === "json") {
      return new NextResponse(JSON.stringify(filteredLogs, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="system-logs-${new Date().toISOString().split("T")[0]}.json"`,
        },
      })
    } else if (format === "txt") {
      const txtContent = filteredLogs
        .map((log) => {
          let content = `[${log.timestamp.toISOString()}] ${log.level} ${log.category}: ${log.message}`
          if (log.details) content += `\n  Details: ${log.details}`
          if (log.userEmail) content += `\n  User: ${log.userEmail}`
          if (log.ipAddress) content += `\n  IP: ${log.ipAddress}`
          if (log.requestId) content += `\n  Request ID: ${log.requestId}`
          if (log.duration) content += `\n  Duration: ${log.duration}ms`
          if (log.stackTrace) content += `\n  Stack Trace:\n${log.stackTrace}`
          return content
        })
        .join("\n\n")

      return new NextResponse(txtContent, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="system-logs-${new Date().toISOString().split("T")[0]}.txt"`,
        },
      })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Error exporting logs:", error)
    return NextResponse.json({ error: "Failed to export logs" }, { status: 500 })
  }
}
