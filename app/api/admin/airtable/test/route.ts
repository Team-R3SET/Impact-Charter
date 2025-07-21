import { type NextRequest, NextResponse } from "next/server"
import { testAirtableQuery } from "@/lib/airtable-debug"

export async function POST(request: NextRequest) {
  try {
    const { tableName, options, airtableApiKey, airtableBaseId } = await request.json()

    if (!tableName) {
      return NextResponse.json({ success: false, error: "Table name is required" }, { status: 400 })
    }

    const result = await testAirtableQuery(tableName, options, {
      airtableApiKey,
      airtableBaseId,
      userEmail: "admin-test",
      isAirtableConnected: false,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error running Airtable test:", error)
    return NextResponse.json({
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime: 0,
      timestamp: new Date().toISOString(),
    })
  }
}
