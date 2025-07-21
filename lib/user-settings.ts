export interface UserSettings {
  id?: string
  userEmail: string
  airtableApiKey?: string
  airtableBaseId?: string
  isAirtableConnected: boolean
  createdDate: string
  lastModified: string
}

export interface AirtableConnectionTest {
  success: boolean
  message: string
  baseInfo?: {
    name: string
    tables: string[]
  }
}

/**
 * Fetch the persisted UserSettings for the given e-mail.
 * Falls back to `null` if the record does not exist or the API is unreachable.
 */
export async function getUserSettings(userEmail: string): Promise<UserSettings | null> {
  try {
    // Call our own API route — keeps the DB logic in one place.
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/user-settings?email=${encodeURIComponent(userEmail)}`,
      { cache: "no-store" },
    )

    if (!res.ok) {
      console.warn(`[getUserSettings] /api/user-settings responded ${res.status}`)
      return null
    }

    const data = (await res.json()) as { settings?: UserSettings }
    return data.settings ?? null
  } catch (error) {
    console.error("[getUserSettings] Unexpected error:", error)
    return null
  }
}
