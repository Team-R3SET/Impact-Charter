import { NextRequest, NextResponse } from "next/server"
import { syncLocalPlansToAirtable } from "@/lib/airtable"
import { getUserSettings } from "@/lib/user-settings"

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json()

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      )
    }

    const userSettings = await getUserSettings(userEmail)
    
    if (!userSettings?.airtablePersonalAccessToken || !userSettings?.airtableBaseId) {
      return NextResponse.json(
        { 
          success: false,
          syncedCount: 0,
          skippedCount: 0,
          errors: ["Airtable credentials not found. Please configure your Airtable settings first."],
          details: []
        },
        { status: 400 }
      )
    }

    const result = await syncLocalPlansToAirtable(
      userEmail, 
      userSettings.airtableBaseId, 
      userSettings.airtablePersonalAccessToken
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Sync API error:", error)
    return NextResponse.json(
      { 
        success: false,
        syncedCount: 0,
        skippedCount: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        details: []
      },
      { status: 500 }
    )
  }
}
