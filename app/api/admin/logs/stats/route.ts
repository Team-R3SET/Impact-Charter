import { NextResponse } from "next/server"
import { generateMockLogs, calculateLogStats } from "@/lib/system-logs"

export async function GET() {
  try {
    const logs = generateMockLogs(500)
    const stats = calculateLogStats(logs)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching log stats:", error)
    return NextResponse.json({ error: "Failed to fetch log stats" }, { status: 500 })
  }
}
