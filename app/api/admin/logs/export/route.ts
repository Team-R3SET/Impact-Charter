import { type NextRequest, NextResponse } from "next/server"
import { exportLogs, type LogExportOptions } from "@/lib/system-logs"
import { getCurrentUser, canViewLogs } from "@/lib/user-management"

export async function POST(request: NextRequest) {
  try {
    // Mock authentication - in a real app, get user from session/token
    const currentUser = await getCurrentUser("admin@example.com")

    if (!currentUser || !canViewLogs(currentUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { format, filters, limit } = body as LogExportOptions

    if (!["csv", "json", "txt"].includes(format)) {
      return NextResponse.json({ error: "Invalid export format" }, { status: 400 })
    }

    const exportData = await exportLogs({ format, filters, limit })

    const contentTypes = {
      csv: "text/csv",
      json: "application/json",
      txt: "text/plain",
    }

    const fileExtensions = {
      csv: "csv",
      json: "json",
      txt: "txt",
    }

    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `system-logs-${timestamp}.${fileExtensions[format]}`

    return new NextResponse(exportData, {
      headers: {
        "Content-Type": contentTypes[format],
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting logs:", error)
    return NextResponse.json({ error: "Failed to export logs" }, { status: 500 })
  }
}
