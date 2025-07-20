import { randomUUID } from "crypto"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

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

/**
 * Create a section when it doesn't exist or update it when it does.
 * If a PATCH returns 404 (record was deleted or the ID is stale),
 * we fall back to a POST that creates a fresh record.
 */
export async function updateBusinessPlanSection(section: BusinessPlanSection): Promise<void> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.log("[updateBusinessPlanSection] Airtable creds missing – skipping remote update")
    return
  }

  // Shared payload (Airtable "fields" object)
  const fields = {
    planId: section.planId,
    sectionName: section.sectionName,
    sectionContent: section.sectionContent,
    lastModified: section.lastModified,
    modifiedBy: section.modifiedBy,
    // allow undefined → false for booleans
    isComplete: !!section.isComplete,
    submittedForReview: !!section.submittedForReview,
    completedDate: section.completedDate,
  }

  // Helper for the POST branch
  const createRecord = async () => {
    const createRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plan%20Sections`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    })
    if (!createRes.ok) {
      const txt = await createRes.text()
      throw new Error(`Airtable create failed: ${createRes.status} – ${txt}`)
    }
  }

  // If we *think* we have an Airtable record ID, try PATCH first
  if (section.id) {
    const patchRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plan%20Sections/${section.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      },
    )

    // 404 means the record ID is stale or was deleted → fall back to POST
    if (patchRes.status === 404) {
      console.warn(`[updateBusinessPlanSection] Record ${section.id} not found – creating a new one`)
      await createRecord()
      return
    }

    if (!patchRes.ok) {
      const txt = await patchRes.text()
      throw new Error(`Airtable update failed: ${patchRes.status} – ${txt}`)
    }
    return
  }

  // No section.id → always create
  await createRecord()
}

export async function markSectionAsComplete(planId: string, sectionName: string, userEmail: string): Promise<void> {
  console.log(`[markSectionAsComplete] Marking section ${sectionName} as complete for plan ${planId}`)

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.log("[markSectionAsComplete] Airtable API keys missing - operation completed locally")
    return
  }

  try {
    // First, try to find existing section record
    const filterFormula = `AND({planId} = "${planId}", {sectionName} = "${sectionName}")`
    const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plan%20Sections?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
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
    }

    let url: string
    let method: string

    if (existingRecord) {
      // Update existing record
      url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plan%20Sections/${existingRecord.id}`
      method = "PATCH"
      // Preserve existing content if available
      if (existingRecord.fields.sectionContent) {
        updateData.sectionContent = existingRecord.fields.sectionContent
      }
    } else {
      // Create new record
      url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plan%20Sections`
      method = "POST"
      updateData.sectionContent = "" // Default empty content for new records
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: updateData }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Airtable operation failed: ${res.status} - ${errorText}`)
    }

    console.log(`[markSectionAsComplete] Successfully marked section ${sectionName} as complete`)
  } catch (error) {
    console.error("[markSectionAsComplete] Error marking section as complete:", error)
    throw error
  }
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

  // 1️⃣ Local-dev fallback
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
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/User%20Profiles?filterByFormula=${encodeURIComponent(
      filterFormula,
    )}&maxRecords=1`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      cache: "no-store",
    })

    // 2️⃣ Gracefully handle "table missing" or "no rows" conditions
    if (res.status === 404) {
      console.warn("[getUserProfile] Table 'User Profiles' not found – returning null")
      return null
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
    return { id: record.id, ...record.fields }
  } catch (err) {
    // 3️⃣ Log & return null instead of propagating
    console.error("[getUserProfile] Error fetching user profile:", err)
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
