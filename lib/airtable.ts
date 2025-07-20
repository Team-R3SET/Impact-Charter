import { randomUUID } from "crypto"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

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

export async function createBusinessPlan(plan: Omit<BusinessPlan, "id">): Promise<BusinessPlan> {
  // 1️⃣ Local/dev fallback when Airtable keys are missing
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return { id: randomUUID(), ...plan }
  }

  try {
    const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: plan }),
    })

    if (!res.ok) throw new Error("Airtable insert failed")

    const data = await res.json()
    return { id: data.id, ...data.fields }
  } catch (err) {
    // 2️⃣  Graceful degradation when Airtable is unreachable
    console.warn("Airtable unreachable – using local fallback:", err)
    return { id: randomUUID(), ...plan }
  }
}

export async function getBusinessPlans(ownerEmail: string): Promise<BusinessPlan[]> {
  console.log(`[getBusinessPlans] Fetching plans for owner: ${ownerEmail}`)

  // 1️⃣ Local fallback when Airtable keys are missing
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.log("[getBusinessPlans] Airtable API keys missing. Returning sample plans.")
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
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans?filterByFormula=${encodeURIComponent(
      filterFormula,
    )}&sort[0][field]=lastModified&sort[0][direction]=desc`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      cache: "no-store",
    })

    // Airtable returns 200 with an empty array when no records match,
    // but we also guard against an unexpected 404 (table renamed / deleted)
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
    // 3️⃣ Return an empty list instead of throwing to keep UI functional
    return []
  }
}

export async function updateBusinessPlanSection(section: BusinessPlanSection): Promise<void> {
  const url = section.id
    ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plan%20Sections/${section.id}`
    : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plan%20Sections`

  const method = section.id ? "PATCH" : "POST"

  await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
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

export async function getBusinessPlan(planId: string): Promise<BusinessPlan | null> {
  console.log(`[getBusinessPlan] Attempting to fetch planId: ${planId}`)

  // 1️⃣ Skip the request entirely when Airtable creds are missing
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.log("[getBusinessPlan] Airtable API keys missing. Returning local fallback.")
    return {
      id: planId,
      planName: "Untitled Plan",
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      ownerEmail: "local@example.com",
      status: "Draft",
    }
  }

  try {
    console.log(`[getBusinessPlan] Fetching from Airtable for planId: ${planId}`)
    const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans/${planId}`, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      cache: "no-store",
    })

    if (res.status === 404) {
      console.warn(`[getBusinessPlan] Airtable record not found for planId: ${planId}. Returning local fallback.`)
      return {
        id: planId,
        planName: "Untitled Plan",
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        ownerEmail: "local@example.com",
        status: "Draft",
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error(
        `[getBusinessPlan] Airtable request failed for planId: ${planId}. Status: ${res.status}, Response: ${errorText}`,
      )
      throw new Error(`Airtable request failed: ${res.status} - ${errorText}`)
    }

    const data = await res.json()
    console.log(`[getBusinessPlan] Successfully fetched planId: ${planId}`)
    return { id: data.id, ...data.fields }
  } catch (error) {
    console.error(`[getBusinessPlan] Error fetching business plan for planId: ${planId}:`, error)
    return {
      id: planId,
      planName: "Untitled Plan",
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      ownerEmail: "local@example.com",
      status: "Draft",
    }
  }
}

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  console.log(`[getUserProfile] Fetching profile for: ${email}`)

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
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
  }

  try {
    const filterFormula = `{email} = "${email}"`
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/User%20Profiles?filterByFormula=${encodeURIComponent(filterFormula)}`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error(`Airtable request failed: ${res.status}`)
    }

    const data = await res.json()
    if (data.records.length === 0) {
      return null
    }

    const record = data.records[0]
    return { id: record.id, ...record.fields }
  } catch (error) {
    console.error("[getUserProfile] Error fetching user profile:", error)
    return null
  }
}

export async function createOrUpdateUserProfile(
  profile: Omit<UserProfile, "id" | "createdDate"> & { id?: string },
): Promise<UserProfile> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return {
      id: profile.id || randomUUID(),
      createdDate: new Date().toISOString(),
      ...profile,
    }
  }

  try {
    const url = profile.id
      ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/User%20Profiles/${profile.id}`
      : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/User%20Profiles`

    const method = profile.id ? "PATCH" : "POST"
    const fields = profile.id
      ? { ...profile, lastModified: new Date().toISOString() }
      : { ...profile, createdDate: new Date().toISOString(), lastModified: new Date().toISOString() }

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
      id: profile.id || randomUUID(),
      createdDate: new Date().toISOString(),
      ...profile,
    }
  }
}
