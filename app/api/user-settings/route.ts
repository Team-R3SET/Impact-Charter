import { type NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { userSettingsStore, debugStore } from "@/lib/shared-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    console.log(`Fetching settings for user: ${userEmail}`)
    debugStore()

    // Get settings from store or return defaults
    const settings = userSettingsStore.get(userEmail) || {
      id: randomUUID(),
      userEmail,
      airtablePersonalAccessToken: "",
      airtableBaseId: "",
      isAirtableConnected: false,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }

    // Don't return the actual personal access token for security
    const safeSettings = {
      ...settings,
      airtablePersonalAccessToken: settings.airtablePersonalAccessToken ? "••••••••••••••••" : "",
    }

    return NextResponse.json({ settings: safeSettings })
  } catch (error) {
    console.error("Failed to fetch user settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, airtablePersonalAccessToken, airtableBaseId } = body

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    console.log(`Saving settings for user: ${userEmail}`)
    console.log(`Credentials provided: ${Boolean(airtablePersonalAccessToken)} ${Boolean(airtableBaseId)}`)

    const settings = {
      id: randomUUID(),
      userEmail,
      airtablePersonalAccessToken: airtablePersonalAccessToken || "",
      airtableBaseId: airtableBaseId || "",
      isAirtableConnected: !!(airtablePersonalAccessToken && airtableBaseId),
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }

    // Store settings
    userSettingsStore.set(userEmail, settings)
    console.log(`Settings saved successfully`)
    debugStore()

    // Return safe settings (without actual personal access token)
    const safeSettings = {
      ...settings,
      airtablePersonalAccessToken: settings.airtablePersonalAccessToken ? "••••••••••••••••" : "",
    }

    return NextResponse.json({ settings: safeSettings })
  } catch (error) {
    console.error("Failed to save user settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
