import { type NextRequest, NextResponse } from "next/server"
import { testAirtableQuery } from "@/lib/airtable-debug"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tableName, options } = body

    if (!tableName) {
      return NextResponse.json(
        {
          success: false,
          error: "Table name is required",
        },
        { status: 400 },
      )
    }

    const result = await testAirtableQuery(tableName, options)
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
