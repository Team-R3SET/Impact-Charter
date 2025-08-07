import { NextRequest, NextResponse } from "next/server"
import { syncLocalPlansToAirtable } from "@/lib/airtable"
import { userSettingsStore, debugStore } from "@/lib/shared-store"

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json()

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      )
    }

    console.log(`Attempting to sync plans for user: ${userEmail}`)
    debugStore()
    
    const userSettings = userSettingsStore.get(userEmail)
    console.log(`User settings found: ${Boolean(userSettings)}`)
    
    if (!userSettings?.airtablePersonalAccessToken || !userSettings?.airtableBaseId) {
      console.log("Missing credentials:", {
        hasToken: Boolean(userSettings?.airtablePersonalAccessToken),
        hasBaseId: Boolean(userSettings?.airtableBaseId)
      })
      
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

    console.log(`Credentials found, proceeding with sync`)
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
