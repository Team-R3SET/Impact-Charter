import { type NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

// In a real app, this would be stored in a secure database
// For demo purposes, we'll use in-memory storage
const userSettingsStore = new Map<string, any>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    // Get settings from store or return defaults
    const settings = userSettingsStore.get(userEmail) || {
      id: randomUUID(),
      userEmail,
      airtableApiKey: "",
      airtableBaseId: "",
      isAirtableConnected: false,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }

    // Don't return the actual API key for security
    const safeSettings = {
      ...settings,
      airtableApiKey: settings.airtableApiKey ? "••••••••••••••••" : "",
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
    const { userEmail, airtableApiKey, airtableBaseId } = body

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    const settings = {
      id: randomUUID(),
      userEmail,
      airtableApiKey: airtableApiKey || "",
      airtableBaseId: airtableBaseId || "",
      isAirtableConnected: !!(airtableApiKey && airtableBaseId),
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }

    // Store settings
    userSettingsStore.set(userEmail, settings)

    // Return safe settings (without actual API key)
    const safeSettings = {
      ...settings,
      airtableApiKey: settings.airtableApiKey ? "••••••••••••••••" : "",
    }

    return NextResponse.json({ settings: safeSettings })
  } catch (error) {
    console.error("Failed to save user settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
