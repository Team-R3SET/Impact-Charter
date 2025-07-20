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
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    // Local fallback
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
  } catch {
    // Safe fallback instead of propagating undefined id
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

export async function getBusinessPlan(planId: string): Promise<BusinessPlan | null> {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans/${planId}`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) return null

    const data = await response.json()
    return {
      id: data.id,
      ...data.fields,
    }
  } catch (error) {
    console.error("Error fetching business plan:", error)
    return null
  }
}
