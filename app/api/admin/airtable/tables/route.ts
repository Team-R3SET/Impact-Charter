import { type NextRequest, NextResponse } from "next/server"
import { getAirtableTables } from "@/lib/airtable-debug"

export async function POST(request: NextRequest) {
  try {
    const { airtableApiKey, airtableBaseId } = await request.json()

    const tables = await getAirtableTables({
      airtableApiKey,
      airtableBaseId,
      userEmail: "admin-test",
      isAirtableConnected: false,
    })

    return NextResponse.json({ tables })
  } catch (error) {
    console.error("Error fetching Airtable tables:", error)
    return NextResponse.json({ tables: [], error: "Failed to fetch tables" }, { status: 500 })
  }
}
