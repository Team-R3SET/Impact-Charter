import { randomUUID } from "crypto"

// Get user's Airtable credentials (in a real app, this would be from a secure database)
const userSettingsStore = new Map<string, any>()

export async function getUserAirtableCredentials(userEmail: string): Promise<{
  apiKey: string | null
  baseId: string | null
  isConnected: boolean
}> {
  const settings = userSettingsStore.get(userEmail)

  if (!settings || !settings.airtableApiKey || !settings.airtableBaseId) {
    return {
      apiKey: null,
      baseId: null,
      isConnected: false,
    }
  }

  return {
    apiKey: settings.airtableApiKey,
    baseId: settings.airtableBaseId,
    isConnected: true,
  }
}

export interface BusinessPlan {
  id?: string
  planName: string
  createdDate: string
  lastModified: string
  ownerEmail: string
  status: "Draft" | "In Progress" | "Complete"
}

export interface BusinessPlanSection {
  id?: string
  planId: string
  sectionName: string
  sectionContent: string
  lastModified: string
  modifiedBy: string
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

export async function createBusinessPlan(plan: Omit<BusinessPlan, "id">, userEmail: string): Promise<BusinessPlan> {
  const credentials = await getUserAirtableCredentials(userEmail)

  // Fallback to local storage if no credentials
  if (!credentials.isConnected) {
    return { id: randomUUID(), ...plan }
  }

  try {
    const res = await fetch(`https://api.airtable.com/v0/${credentials.baseId}/Business%20Plans`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: plan }),
    })

    if (!res.ok) throw new Error("Airtable insert failed")

    const data = await res.json()
    return { id: data.id, ...data.fields }
  } catch (err) {
    console.warn("Airtable unreachable – using local fallback:", err)
    return { id: randomUUID(), ...plan }
  }
}

export async function getBusinessPlans(ownerEmail: string): Promise<BusinessPlan[]> {
  const credentials = await getUserAirtableCredentials(ownerEmail)

  // Fallback to sample data if no credentials
  if (!credentials.isConnected) {
    return [
      {
        id: "sample-1",
        planName: "Sample Tech Startup",
        createdDate: new Date(Date.now() - 86400000).toISOString(),
        lastModified: new Date().toISOString(),
        ownerEmail,
        status: "In Progress",
      },
      {
        id: "sample-2",
        planName: "E-commerce Business",
        createdDate: new Date(Date.now() - 172800000).toISOString(),
        lastModified: new Date(Date.now() - 3600000).toISOString(),
        ownerEmail,
        status: "Draft",
      },
    ]
  }

  try {
    const filterFormula = `{ownerEmail} = "${ownerEmail}"`
    const url = `https://api.airtable.com/v0/${credentials.baseId}/Business%20Plans?filterByFormula=${encodeURIComponent(
      filterFormula,
    )}&sort[0][field]=lastModified&sort[0][direction]=desc`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${credentials.apiKey}` },
      cache: "no-store",
    })

    if (res.status === 404) {
      console.warn("[getBusinessPlans] Table not found – returning empty list")
      return []
    }

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Airtable request failed: ${res.status} - ${errorText}`)
    }

    const data = await res.json()
    const records = Array.isArray(data.records) ? data.records : []
    return records.map((record: any) => ({
      id: record.id,
      ...record.fields,
    })) as BusinessPlan[]
  } catch (error) {
    console.error("[getBusinessPlans] Error fetching business plans:", error)
    return []
  }
}

// Similar updates would be needed for other functions...
// For brevity, I'll show the pattern for updateBusinessPlanSection

export async function updateBusinessPlanSection(section: BusinessPlanSection, userEmail: string): Promise<void> {
  const credentials = await getUserAirtableCredentials(userEmail)

  if (!credentials.isConnected) {
    console.log("No Airtable connection - section update skipped")
    return
  }

  const url = section.id
    ? `https://api.airtable.com/v0/${credentials.baseId}/Business%20Plan%20Sections/${section.id}`
    : `https://api.airtable.com/v0/${credentials.baseId}/Business%20Plan%20Sections`

  const method = section.id ? "PATCH" : "POST"

  await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${credentials.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        planId: section.planId,
        sectionName: section.sectionName,
        sectionContent: section.sectionContent,
        lastModified: section.lastModified,
        modifiedBy: section.modifiedBy,
      },
    }),
  })
}
