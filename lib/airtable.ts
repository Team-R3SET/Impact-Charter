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

/**
 * Try to fetch the plan from Airtable.
 * - If Airtable is not configured **or** the record is missing (404),
 *   return a minimal fallback object so the page can still render locally.
 */
export async function getBusinessPlan(planId: string): Promise<BusinessPlan | null> {
  // 1️⃣ Skip the request entirely when Airtable creds are missing
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
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
    const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans/${planId}`, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    })

    if (res.status === 404) {
      // 2️⃣  Gracefully handle missing records instead of returning null
      return {
        id: planId,
        planName: "Untitled Plan",
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        ownerEmail: "local@example.com",
        status: "Draft",
      }
    }

    if (!res.ok) throw new Error("Airtable request failed")

    const data = await res.json()
    return { id: data.id, ...data.fields }
  } catch (error) {
    console.error("Error fetching business plan:", error)
    // 3️⃣  Last-chance fallback
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
