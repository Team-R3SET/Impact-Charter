import { type NextRequest, NextResponse } from "next/server"
import { getAirtableTables } from "@/lib/airtable-debug"

export async function GET(request: NextRequest) {
  try {
    const tables = await getAirtableTables()
    return NextResponse.json({ tables })
  } catch (error) {
    console.error("Error fetching Airtable tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        tables: [],
      },
      { status: 200 }, // Return 200 with empty tables instead of 500
    )
  }
}
