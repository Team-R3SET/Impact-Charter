import Airtable from "airtable"

export interface BusinessPlan {
  id: string
  planName: string
  description: string
  ownerEmail: string
  status: "Draft" | "In Progress" | "Complete" | "Submitted for Review"
  createdDate: string
  lastModified: string
  sections: PlanSection[]
}

export interface PlanSection {
  id: string
  name: string
  content: string
  completed: boolean
  order: number
}

export interface AirtableSettings {
  apiKey?: string
  baseId?: string
}

// Initialize Airtable
let airtableBase: any = null

function initializeAirtable(settings?: AirtableSettings) {
  const apiKey = settings?.apiKey || process.env.AIRTABLE_API_KEY
  const baseId = settings?.baseId || process.env.AIRTABLE_BASE_ID

  if (apiKey && baseId) {
    Airtable.configure({ apiKey })
    airtableBase = Airtable.base(baseId)
    return true
  }
  return false
}

export async function createBusinessPlan(
  data: {
    planName: string
    description: string
    ownerEmail: string
  },
  settings?: AirtableSettings,
): Promise<BusinessPlan> {
  const isAirtableConfigured = initializeAirtable(settings)

  if (isAirtableConfigured && airtableBase) {
    try {
      const record = await airtableBase("Business Plans").create({
        "Plan Name": data.planName,
        Description: data.description,
        "Owner Email": data.ownerEmail,
        Status: "Draft",
        "Created Date": new Date().toISOString(),
        "Last Modified": new Date().toISOString(),
      })

      return {
        id: record.id,
        planName: record.fields["Plan Name"] as string,
        description: record.fields["Description"] as string,
        ownerEmail: record.fields["Owner Email"] as string,
        status: (record.fields["Status"] as BusinessPlan["status"]) || "Draft",
        createdDate: record.fields["Created Date"] as string,
        lastModified: record.fields["Last Modified"] as string,
        sections: [],
      }
    } catch (error) {
      console.error("Airtable error:", error)
      // Fall back to local creation
    }
  }

  // Fallback: create a local business plan
  const fallbackPlan: BusinessPlan = {
    id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    planName: data.planName,
    description: data.description,
    ownerEmail: data.ownerEmail,
    status: "Draft",
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    sections: [
      { id: "executive-summary", name: "Executive Summary", content: "", completed: false, order: 1 },
      { id: "market-analysis", name: "Market Analysis", content: "", completed: false, order: 2 },
      { id: "financial-projections", name: "Financial Projections", content: "", completed: false, order: 3 },
      { id: "marketing-strategy", name: "Marketing Strategy", content: "", completed: false, order: 4 },
    ],
  }

  return fallbackPlan
}

export async function getBusinessPlans(ownerEmail: string, settings?: AirtableSettings): Promise<BusinessPlan[]> {
  const isAirtableConfigured = initializeAirtable(settings)

  if (isAirtableConfigured && airtableBase) {
    try {
      const records = await airtableBase("Business Plans")
        .select({
          filterByFormula: `{Owner Email} = "${ownerEmail}"`,
        })
        .all()

      return records.map((record) => ({
        id: record.id,
        planName: record.fields["Plan Name"] as string,
        description: record.fields["Description"] as string,
        ownerEmail: record.fields["Owner Email"] as string,
        status: (record.fields["Status"] as BusinessPlan["status"]) || "Draft",
        createdDate: record.fields["Created Date"] as string,
        lastModified: record.fields["Last Modified"] as string,
        sections: [],
      }))
    } catch (error) {
      console.error("Airtable error:", error)
    }
  }

  // Fallback: return empty array
  return []
}

export async function getBusinessPlan(planId: string, settings?: AirtableSettings): Promise<BusinessPlan | null> {
  const isAirtableConfigured = initializeAirtable(settings)

  if (isAirtableConfigured && airtableBase) {
    try {
      const record = await airtableBase("Business Plans").find(planId)

      return {
        id: record.id,
        planName: record.fields["Plan Name"] as string,
        description: record.fields["Description"] as string,
        ownerEmail: record.fields["Owner Email"] as string,
        status: (record.fields["Status"] as BusinessPlan["status"]) || "Draft",
        createdDate: record.fields["Created Date"] as string,
        lastModified: record.fields["Last Modified"] as string,
        sections: [],
      }
    } catch (error) {
      console.error("Airtable error:", error)
    }
  }

  return null
}

export async function getAirtableHealth(settings?: AirtableSettings): Promise<{ connected: boolean; error?: string }> {
  const isAirtableConfigured = initializeAirtable(settings)

  if (!isAirtableConfigured) {
    return { connected: false, error: "Airtable not configured" }
  }

  try {
    // Try to fetch one record to test connection
    await airtableBase("Business Plans").select({ maxRecords: 1 }).firstPage()
    return { connected: true }
  } catch (error) {
    return { connected: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Export the service object
export const airtableService = {
  createBusinessPlan,
  getBusinessPlans,
  getBusinessPlan,
  getAirtableHealth,
}
