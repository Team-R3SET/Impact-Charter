import { randomUUID } from "crypto"
import { LocalStorageManager } from "./local-storage"
import type { UserSettings } from "./user-settings"

// Helper to get credentials, prioritizing user settings over environment variables
const getCredentials = (settings: UserSettings | null) => {
  const apiKey = settings?.airtableApiKey || process.env.AIRTABLE_API_KEY
  const baseId = settings?.airtableBaseId || process.env.AIRTABLE_BASE_ID
  return { apiKey, baseId, isConnected: !!(apiKey && baseId) }
}

export interface BusinessPlan {
  id?: string
  planName: string
  createdDate: string
  lastModified: string
  ownerEmail: string
  status: "Draft" | "In Progress" | "Complete" | "Submitted for Review"
}

export interface BusinessPlanSection {
  id?: string
  planId: string
  sectionName: string
  sectionContent: string
  lastModified: string
  modifiedBy: string
  isComplete?: boolean
  submittedForReview?: boolean
  completedDate?: string
}

export interface UserProfile {
  id?: string
  name: string
  email: string
  avatar?: string
  company?: string
  role?: string
  bio?: string
  createdDate: string
  lastModified: string
}

async function withLocalFallback<T>(
  settings: UserSettings | null,
  operation: (apiKey: string, baseId: string) => Promise<T>,
  fallback: () => T,
  operationName: string,
): Promise<T> {
  const { apiKey, baseId, isConnected } = getCredentials(settings)

  if (!isConnected || !apiKey || !baseId) {
    console.log(`[${operationName}] Airtable not connected - using local fallback.`)
    return fallback()
  }

  try {
    return await operation(apiKey, baseId)
  } catch (error) {
    console.warn(`[${operationName}] Airtable operation failed, using local fallback:`, error)
    return fallback()
  }
}

export async function createBusinessPlan(
  plan: Omit<BusinessPlan, "id">,
  settings: UserSettings | null,
): Promise<BusinessPlan> {
  return withLocalFallback(
    settings,
    async (apiKey, baseId) => {
      const res = await fetch(`https://api.airtable.com/v0/${baseId}/Business%20Plans`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: plan }),
      })

      if (!res.ok) throw new Error(`Airtable insert failed: ${res.status}`)

      const data = await res.json()
      const createdPlan = { id: data.id, ...data.fields }

      // Also save to local storage as backup
      if (typeof window !== "undefined") {
        LocalStorageManager.saveBusinessPlans([createdPlan])
      }

      return createdPlan
    },
    () => {
      const localPlan = { id: randomUUID(), ...plan }
      if (typeof window !== "undefined") {
        LocalStorageManager.saveBusinessPlans([localPlan])
      }
      return localPlan
    },
    "createBusinessPlan",
  )
}

export async function getBusinessPlans(ownerEmail: string, settings: UserSettings | null): Promise<BusinessPlan[]> {
  console.log(`[getBusinessPlans] Fetching plans for owner: ${ownerEmail}`)

  return withLocalFallback(
    settings,
    async (apiKey, baseId) => {
      const filterFormula = `{ownerEmail} = "${ownerEmail}"`
      const url = `https://api.airtable.com/v0/${baseId}/Business%20Plans?filterByFormula=${encodeURIComponent(
        filterFormula,
      )}&sort[0][field]=lastModified&sort[0][direction]=desc`

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      })

      if (!res.ok) throw new Error(`Airtable request failed: ${res.status}`)
      const data = await res.json()
      const plans = (data.records || []).map((r: any) => ({ id: r.id, ...r.fields }))
      LocalStorageManager.saveBusinessPlans(plans)
      return plans
    },
    () => LocalStorageManager.getBusinessPlans(ownerEmail),
    "getBusinessPlans",
  )
}

export async function updateBusinessPlanSection(
  section: BusinessPlanSection,
  settings: UserSettings | null,
): Promise<void> {
  await withLocalFallback(
    settings,
    async (apiKey, baseId) => {
      const fields = {
        planId: section.planId,
        sectionName: section.sectionName,
        sectionContent: section.sectionContent,
        lastModified: section.lastModified,
        modifiedBy: section.modifiedBy,
        isComplete: !!section.isComplete,
        submittedForReview: !!section.submittedForReview,
        completedDate: section.completedDate,
      }

      const createRecord = async () => {
        const createRes = await fetch(`https://api.airtable.com/v0/${baseId}/Business%20Plan%20Sections`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields }),
        })
        if (!createRes.ok) {
          const txt = await createRes.text()
          throw new Error(`Airtable create failed: ${createRes.status} – ${txt}`)
        }
      }

      if (section.id) {
        const patchRes = await fetch(`https://api.airtable.com/v0/${baseId}/Business%20Plan%20Sections/${section.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields }),
        })

        if (patchRes.status === 404) {
          console.warn(`[updateBusinessPlanSection] Record ${section.id} not found – creating a new one`)
          await createRecord()
          return
        }

        if (!patchRes.ok) {
          const txt = await patchRes.text()
          throw new Error(`Airtable update failed: ${patchRes.status} – ${txt}`)
        }
      } else {
        await createRecord()
      }

      // Save to local storage as backup
      if (typeof window !== "undefined") {
        LocalStorageManager.savePlanSection(section)
      }
    },
    () => {
      // Local fallback
      if (typeof window !== "undefined") {
        LocalStorageManager.savePlanSection(section)
      }
      console.log("[updateBusinessPlanSection] Saved to local storage")
    },
    "updateBusinessPlanSection",
  )
}

export async function markSectionAsComplete(
  planId: string,
  sectionName: string,
  userEmail: string,
  settings: UserSettings | null,
): Promise<void> {
  console.log(`[markSectionAsComplete] Marking section ${sectionName} as complete for plan ${planId}`)

  await withLocalFallback(
    settings,
    async (apiKey, baseId) => {
      const filterFormula = `AND({planId} = "${planId}", {sectionName} = "${sectionName}")`
      const searchUrl = `https://api.airtable.com/v0/${baseId}/Business%20Plan%20Sections?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`

      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      })

      if (!searchRes.ok) {
        throw new Error(`Failed to search for section: ${searchRes.status}`)
      }

      const searchData = await searchRes.json()
      const existingRecord = searchData.records?.[0]

      const updateData = {
        planId,
        sectionName,
        isComplete: true,
        submittedForReview: true,
        completedDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        modifiedBy: userEmail,
        sectionContent: existingRecord?.fields?.sectionContent || "",
      }

      let url: string
      let method: string

      if (existingRecord) {
        url = `https://api.airtable.com/v0/${baseId}/Business%20Plan%20Sections/${existingRecord.id}`
        method = "PATCH"
      } else {
        url = `https://api.airtable.com/v0/${baseId}/Business%20Plan%20Sections`
        method = "POST"
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: updateData }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Airtable operation failed: ${res.status} - ${errorText}`)
      }

      // Save to local storage as backup
      if (typeof window !== "undefined") {
        LocalStorageManager.savePlanSection({
          id: existingRecord?.id,
          ...updateData,
        })
      }

      console.log(`[markSectionAsComplete] Successfully marked section ${sectionName} as complete`)
    },
    () => {
      // Local fallback
      if (typeof window !== "undefined") {
        LocalStorageManager.savePlanSection({
          planId,
          sectionName,
          sectionContent: "",
          isComplete: true,
          submittedForReview: true,
          completedDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          modifiedBy: userEmail,
        })
      }
      console.log(`[markSectionAsComplete] Marked section ${sectionName} as complete locally`)
    },
    "markSectionAsComplete",
  )
}

export async function getBusinessPlan(planId: string, settings: UserSettings | null): Promise<BusinessPlan | null> {
  console.log(`[getBusinessPlan] Attempting to fetch planId: ${planId}`)

  return withLocalFallback(
    settings,
    async (apiKey, baseId) => {
      const res = await fetch(`https://api.airtable.com/v0/${baseId}/Business%20Plans/${planId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      })

      if (res.status === 404) {
        throw new Error(`Plan not found: ${planId}`)
      }

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Airtable request failed: ${res.status} - ${errorText}`)
      }

      const data = await res.json()
      const plan = { id: data.id, ...data.fields }

      // Save to local storage
      if (typeof window !== "undefined") {
        LocalStorageManager.saveBusinessPlans([plan])
      }

      console.log(`[getBusinessPlan] Successfully fetched planId: ${planId}`)
      return plan
    },
    () => {
      if (typeof window !== "undefined") {
        const localPlan = LocalStorageManager.getBusinessPlan(planId)
        if (localPlan) return localPlan
      }

      // Final fallback
      return {
        id: planId,
        planName: "Untitled Plan",
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        ownerEmail: "local@example.com",
        status: "Draft",
      }
    },
    "getBusinessPlan",
  )
}

export async function getUserProfile(email: string, settings: UserSettings | null): Promise<UserProfile | null> {
  console.log(`[getUserProfile] Fetching profile for: ${email}`)

  return withLocalFallback(
    settings,
    async (apiKey, baseId) => {
      const filterFormula = `{email} = "${email}"`
      const url = `https://api.airtable.com/v0/${baseId}/User%20Profiles?filterByFormula=${encodeURIComponent(
        filterFormula,
      )}&maxRecords=1`

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      })

      if (res.status === 404) {
        throw new Error("User Profiles table not found")
      }

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Airtable request failed: ${res.status} – ${text}`)
      }

      const data = await res.json()
      if (!Array.isArray(data.records) || data.records.length === 0) {
        return null
      }

      const record = data.records[0]
      const profile = { id: record.id, ...record.fields }

      // Save to local storage
      if (typeof window !== "undefined") {
        LocalStorageManager.saveUserProfile(profile)
      }

      return profile
    },
    () => {
      if (typeof window !== "undefined") {
        const localProfile = LocalStorageManager.getUserProfile(email)
        if (localProfile) return localProfile
      }

      // Default profile fallback
      return {
        id: "local-user",
        name: "Demo User",
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        company: "Demo Company",
        role: "Entrepreneur",
        bio: "Building amazing products with collaborative business planning.",
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      }
    },
    "getUserProfile",
  )
}

export async function createOrUpdateUserProfile(
  profile: Omit<UserProfile, "id" | "createdDate"> & { id?: string },
  settings: UserSettings | null,
): Promise<UserProfile> {
  return withLocalFallback(
    settings,
    async (apiKey, baseId) => {
      const url = profile.id
        ? `https://api.airtable.com/v0/${baseId}/User%20Profiles/${profile.id}`
        : `https://api.airtable.com/v0/${baseId}/User%20Profiles`

      const method = profile.id ? "PATCH" : "POST"
      const fields = profile.id
        ? { ...profile, lastModified: new Date().toISOString() }
        : { ...profile, createdDate: new Date().toISOString(), lastModified: new Date().toISOString() }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      })

      if (!res.ok) throw new Error("Airtable operation failed")

      const data = await res.json()
      const savedProfile = { id: data.id, ...data.fields }

      // Save to local storage
      if (typeof window !== "undefined") {
        LocalStorageManager.saveUserProfile(savedProfile)
      }

      return savedProfile
    },
    () => {
      const localProfile = {
        id: profile.id || randomUUID(),
        createdDate: new Date().toISOString(),
        ...profile,
      }

      if (typeof window !== "undefined") {
        LocalStorageManager.saveUserProfile(localProfile)
      }

      return localProfile
    },
    "createOrUpdateUserProfile",
  )
}

/**
 * Thin wrapper around the Airtable REST API so other parts of the app
 * can use a reusable, strongly-typed client instead of calling `fetch`
 * directly. Only the endpoints our app actually needs are implemented,
 * but the class can be extended at any time.
 */
export class AirtableClient {
  constructor(
    private readonly apiKey: string,
    private readonly baseId: string,
  ) {
    if (!apiKey || !baseId) {
      throw new Error(
        "[AirtableClient] Both apiKey and baseId are required. " +
          "Did you forget to set AIRTABLE_API_KEY / AIRTABLE_BASE_ID?",
      )
    }
  }

  private async request<T = unknown>(url: string, init?: RequestInit & { body?: unknown }): Promise<T> {
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      body: typeof init?.body === "string" ? init.body : init?.body ? JSON.stringify(init.body) : undefined,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`[AirtableClient] ${res.status} ${res.statusText} – ${text}`)
    }

    return (await res.json()) as T
  }

  private tableUrl(tableName: string, recordId?: string): string {
    return `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(
      tableName,
    )}${recordId ? `/${recordId}` : ""}`
  }

  /**
   * Create a record in the specified table.
   */
  async create<TFields extends Record<string, unknown>>(table: string, fields: TFields) {
    return this.request<{ id: string; fields: TFields }>(this.tableUrl(table), {
      method: "POST",
      body: { fields },
    })
  }

  /**
   * Update a record (PATCH) in the specified table.
   */
  async update<TFields extends Record<string, unknown>>(table: string, id: string, fields: Partial<TFields>) {
    return this.request<{ id: string; fields: TFields }>(this.tableUrl(table, id), {
      method: "PATCH",
      body: { fields },
    })
  }

  /**
   * Get a single record by ID.
   */
  async findOne<TFields extends Record<string, unknown>>(table: string, id: string) {
    return this.request<{ id: string; fields: TFields }>(this.tableUrl(table, id))
  }
}
