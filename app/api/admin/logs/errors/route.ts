import { type NextRequest, NextResponse } from "next/server"
import { getErrorLogs, getErrorStats } from "@/lib/logging"
import { getCurrentUser, canViewLogs } from "@/lib/user-management"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const severity = searchParams.get("severity") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null
    const resolved =
      searchParams.get("resolved") === "true" ? true : searchParams.get("resolved") === "false" ? false : undefined

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    const user = await getCurrentUser(userEmail)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!canViewLogs(user)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const logs = await getErrorLogs(limit, offset, severity || undefined, resolved)
    const stats = await getErrorStats()

    return NextResponse.json({ logs, stats })
  } catch (error) {
    console.error("Failed to fetch error logs:", error)
    return NextResponse.json({ error: "Failed to fetch error logs" }, { status: 500 })
  }
}
