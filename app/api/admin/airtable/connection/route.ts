import { type NextRequest, NextResponse } from "next/server"
import { getAirtableConnection } from "@/lib/airtable-debug"

export async function POST(request: NextRequest) {
  try {
    const { airtableApiKey, airtableBaseId } = await request.json()

    // Pass credentials as a mock settings object
    const connection = await getAirtableConnection({
      airtableApiKey,
      airtableBaseId,
      userEmail: "admin-test", // email is not used by the debug function
      isAirtableConnected: false, // not used by the debug function
    })

    return NextResponse.json(connection)
  } catch (error) {
    console.error("Error checking Airtable connection:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ isConnected: false, error: errorMessage }, { status: 500 })
  }
}
