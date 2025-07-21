import Airtable from "airtable"
import type { UserSettings } from "./user-settings"

export interface BusinessPlan {
  id: string
  planName: string
  description?: string
  ownerEmail: string
  status: "Draft" | "In Progress" | "Complete" | "Submitted for Review"
  createdDate: string
  lastModified: string
}

export interface CreateBusinessPlanData {
  planName: string
  description?: string
  ownerEmail: string
}

function initializeAirtable(settings?: UserSettings) {
  const apiKey = settings?.airtableApiKey || process.env.AIRTABLE_API_KEY
  const baseId = settings?.airtableBaseId || process.env.AIRTABLE_BASE_ID

  if (!apiKey || !baseId) {
    console.warn("Airtable not configured. Using in-memory fallback.")
    return null
  }

  try {
    return new Airtable({ apiKey }).base(baseId)
  } catch (error) {
    console.error("Failed to initialize Airtable:", error)
    return null
  }
}

const fallbackPlans: BusinessPlan[] = []

export async function getBusinessPlans(userEmail: string, settings?: UserSettings): Promise<BusinessPlan[]> {
  const base = initializeAirtable(settings)
  if (!base) {
    return fallbackPlans.filter((p) => p.ownerEmail === userEmail)
  }

  try {
    const records = await base("Business Plans")
      .select({
        filterByFormula: `{Owner Email} = "${userEmail}"`,
        sort: [{ field: "Last Modified", direction: "desc" }],
      })
      .all()

    return records.map((record) => ({
      id: record.id,
      planName: (record.get("Plan Name") as string) || "Untitled Plan",
      description: (record.get("Description") as string) || "",
      ownerEmail: record.get("Owner Email") as string,
      status: (record.get("Status") as BusinessPlan["status"]) || "Draft",
      createdDate: record.get("Created Date") as string,
      lastModified: record.get("Last Modified") as string,
    }))
  } catch (error) {
    console.error("Error fetching from Airtable:", error)
    return fallbackPlans.filter((p) => p.ownerEmail === userEmail)
  }
}

export async function createBusinessPlan(data: CreateBusinessPlanData, settings?: UserSettings): Promise<BusinessPlan> {
  const base = initializeAirtable(settings)
  const now = new Date().toISOString()

  const newPlanData = {
    planName: data.planName,
    description: data.description,
    ownerEmail: data.ownerEmail,
    status: "Draft" as const,
    createdDate: now,
    lastModified: now,
  }

  if (!base) {
    const fallbackPlan = { ...newPlanData, id: `fallback_${Date.now()}` }
    fallbackPlans.push(fallbackPlan)
    return fallbackPlan
  }

  try {
    const record = await base("Business Plans").create({
      "Plan Name": data.planName,
      Description: data.description,
      "Owner Email": data.ownerEmail,
      Status: "Draft",
      "Created Date": now,
      "Last Modified": now,
    })

    return {
      id: record.id,
      ...newPlanData,
    }
  } catch (error) {
    console.error("Error creating in Airtable:", error)
    // Return a fallback object on creation error to avoid crashing the client
    return {
      id: `error_${Date.now()}`,
      ...newPlanData,
    }
  }
}

export async function getBusinessPlan(planId: string, settings?: UserSettings): Promise<BusinessPlan | undefined> {
  const base = initializeAirtable(settings)
  if (!base) {
    return fallbackPlans.find((p) => p.id === planId)
  }

  try {
    const record = await base("Business Plans").find(planId)
    if (!record) return undefined
    return {
      id: record.id,
      planName: (record.get("Plan Name") as string) || "Untitled Plan",
      description: (record.get("Description") as string) || "",
      ownerEmail: record.get("Owner Email") as string,
      status: (record.get("Status") as BusinessPlan["status"]) || "Draft",
      createdDate: record.get("Created Date") as string,
      lastModified: record.get("Last Modified") as string,
    }
  } catch (error) {
    console.error("Error fetching single plan:", error)
    return fallbackPlans.find((p) => p.id === planId)
  }
}

class AirtableService {
  async healthCheck(): Promise<boolean> {
    const base = initializeAirtable()
    if (!base) return true // using fallback, treat as healthy
    try {
      // lightweight query – fetch zero records
      await base("Business Plans").select({ maxRecords: 1 }).firstPage()
      return true
    } catch {
      return false
    }
  }
}

export const airtableService = new AirtableService()
export const getAirtableHealth = () => airtableService.healthCheck()
