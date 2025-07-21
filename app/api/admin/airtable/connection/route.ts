import { type NextRequest, NextResponse } from "next/server"
import { getAirtableConnection } from "@/lib/airtable-debug"

export async function GET(request: NextRequest) {
  try {
    const connection = await getAirtableConnection()
    return NextResponse.json(connection)
  } catch (error) {
    console.error("Error checking Airtable connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
