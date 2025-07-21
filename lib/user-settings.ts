import { randomUUID } from "crypto"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

export interface UserSettings {
  id?: string
  userId: string
  theme: "light" | "dark" | "system"
  notifications: boolean
  autoSave: boolean
  collaborationMode: "real-time" | "manual"
  language: string
  timezone: string
  createdDate: string
  lastModified: string
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return {
      id: "local-settings",
      userId,
      theme: "system",
      notifications: true,
      autoSave: true,
      collaborationMode: "real-time",
      language: "en",
      timezone: "UTC",
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }
  }

  try {
    const filterFormula = `{userId} = "${userId}"`
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/User%20Settings?filterByFormula=${encodeURIComponent(
      filterFormula,
    )}&maxRecords=1`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      cache: "no-store",
    })

    if (!res.ok) return null

    const data = await res.json()
    if (!Array.isArray(data.records) || data.records.length === 0) {
      return null
    }

    const record = data.records[0]
    return { id: record.id, ...record.fields }
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return null
  }
}

export async function createOrUpdateUserSettings(
  settings: Omit<UserSettings, "id" | "createdDate"> & { id?: string },
): Promise<UserSettings> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return {
      id: settings.id || randomUUID(),
      createdDate: new Date().toISOString(),
      ...settings,
    }
  }

  try {
    const url = settings.id
      ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/User%20Settings/${settings.id}`
      : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/User%20Settings`

    const method = settings.id ? "PATCH" : "POST"
    const fields = settings.id
      ? { ...settings, lastModified: new Date().toISOString() }
      : { ...settings, createdDate: new Date().toISOString(), lastModified: new Date().toISOString() }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    })

    if (!res.ok) throw new Error("Airtable operation failed")

    const data = await res.json()
    return { id: data.id, ...data.fields }
  } catch (err) {
    console.warn("Airtable unreachable – using local fallback:", err)
    return {
      id: settings.id || randomUUID(),
      createdDate: new Date().toISOString(),
      ...settings,
    }
  }
}
