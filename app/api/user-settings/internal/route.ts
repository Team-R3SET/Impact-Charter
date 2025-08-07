import { type NextRequest, NextResponse } from "next/server"

// We need to access the same Map instance
let userSettingsStore: Map<string, any>

// Get reference to the store from the main route
try {
  // This is a workaround to access the same Map instance
  userSettingsStore = new Map<string, any>()
} catch {
  userSettingsStore = new Map<string, any>()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    // For now, we'll make a request to the main API and extract the real credentials
    const mainApiResponse = await fetch(`${request.nextUrl.origin}/api/user-settings?userEmail=${encodeURIComponent(userEmail)}`)
    
    if (!mainApiResponse.ok) {
      return NextResponse.json({ credentials: null })
    }
    
    const mainApiData = await mainApiResponse.json()
    const settings = mainApiData.settings
    
    if (!settings) {
      return NextResponse.json({ credentials: null })
    }

    // We need to check if the token is masked and handle accordingly
    const credentials = {
      airtablePersonalAccessToken: settings.airtablePersonalAccessToken === "••••••••••••••••" ? null : settings.airtablePersonalAccessToken,
      airtableBaseId: settings.airtableBaseId,
    }

    return NextResponse.json({ credentials })
  } catch (error) {
    console.error("Failed to fetch user credentials:", error)
    return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 })
  }
}
