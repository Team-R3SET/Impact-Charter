"use client"

import { z } from "zod"

/**
 * Schema & Type ──────────────────────────────────────────────
 */
const UserSettingsSchema = z.object({
  userEmail: z.string().email(),
  airtableApiKey: z.string().optional().default(""),
  airtableBaseId: z.string().optional().default(""),
  // Derived flag – true only when both key & baseId exist
  isAirtableConnected: z.boolean().default(false),
})

export type UserSettings = z.infer<typeof UserSettingsSchema>

/**
 * Helpers ────────────────────────────────────────────────────
 */
const keyFor = (email: string) => `bp:user-settings:${email}`

/**
 * Read settings for a given user from localStorage.
 * If nothing is stored yet, return the zero-state object.
 */
export function getUserSettings(email: string): UserSettings {
  if (typeof window === "undefined") {
    // SSR – return empty so components can render
    return {
      userEmail: email,
      airtableApiKey: "",
      airtableBaseId: "",
      isAirtableConnected: false,
    }
  }

  try {
    const raw = localStorage.getItem(keyFor(email))
    if (raw) {
      const parsed = UserSettingsSchema.parse(JSON.parse(raw))
      return parsed
    }
  } catch (err) {
    console.error("[user-settings] Failed to parse settings", err)
  }

  return {
    userEmail: email,
    airtableApiKey: "",
    airtableBaseId: "",
    isAirtableConnected: false,
  }
}

/**
 * Save settings (merges & recalculates connection flag).
 * Returns the persisted object.
 */
export function saveUserSettings(settings: UserSettings): UserSettings {
  const combined: UserSettings = {
    ...settings,
    isAirtableConnected: Boolean(settings.airtableApiKey && settings.airtableBaseId),
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(keyFor(settings.userEmail), JSON.stringify(combined))
  }

  return combined
}
