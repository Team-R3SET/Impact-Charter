import { randomUUID } from "crypto"
import { LocalStorageManager } from "./local-storage"

// Updated to use personal access token instead of deprecated API key
const AIRTABLE_PERSONAL_ACCESS_TOKEN = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
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

// Enhanced error handling with local fallback
async function withLocalFallback<T>(operation: () => Promise<T>, fallback: () => T, operationName: string): Promise<T> {
  // Updated credential check to use personal access token
  // Skip Airtable entirely if credentials are missing
  if (!AIRTABLE_PERSONAL_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
    console.log(`[${operationName}] Airtable credentials missing - using local fallback`)
    return fallback()
  }

  try {
    const result = await operation()
    return result
  } catch (error) {
    console.warn(`[${operationName}] Airtable operation failed, using local fallback:`, error)
    return fallback()
  }
}

export async function createBusinessPlan(plan: Omit<BusinessPlan, "id">): Promise<BusinessPlan> {
  return withLocalFallback(
    async () => {
      const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans`, {
        method: "POST",
        headers: {
          // Updated authorization header to use personal access token
          Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
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

export async function getBusinessPlans(ownerEmail: string): Promise<BusinessPlan[]> {
  console.log(`[getBusinessPlans] Fetching plans for owner: ${ownerEmail}`)

  return withLocalFallback(
    async () => {
      const filterFormula = `{ownerEmail} = "${ownerEmail}"`
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans?filterByFormula=${encodeURIComponent(
        filterFormula,
      )}&sort[0][field]=lastModified&sort[0][direction]=desc`

      const res = await fetch(url, {
        // Updated authorization header to use personal access token
        headers: { Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}` },
        cache: "no-store",
      })

      if (res.status === 404) {
        console.warn("[getBusinessPlans] Table not found")
        throw new Error("Table not found")
      }

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Airtable request failed: ${res.status} - ${errorText}`)
      }

      const data = await res.json()
      const records = Array.isArray(data.records) ? data.records : []
      const plans = records.map((record: any) => ({
        id: record.id,
        ...record.fields,
      })) as BusinessPlan[]

      // Sync to local storage
      if (typeof window !== "undefined" && plans.length > 0) {
        LocalStorageManager.saveBusinessPlans(plans)
      }

      return plans
    },
    () => {
      if (typeof window !== "undefined") {
        return LocalStorageManager.getBusinessPlans(ownerEmail)
      }
      // Server-side fallback
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
    },
    "getBusinessPlans",
  )
}

export async function updateBusinessPlanSection(section: BusinessPlanSection): Promise<void> {
  await withLocalFallback(
    async () => {
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
        const createRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plan%20Sections`, {
          method: "POST",
          headers: {
            // Updated authorization header to use personal access token
            Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
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
        const patchRes = await fetch(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plan%20Sections/${section.id}`,
          {
            method: "PATCH",
            headers: {
              // Updated authorization header to use personal access token
              Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fields }),
          },
        )

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

export async function markSectionAsComplete(planId: string, sectionName: string, userEmail: string): Promise<void> {
  console.log(`[markSectionAsComplete] Marking section ${sectionName} as complete for plan ${planId}`)

  await withLocalFallback(
    async () => {
      const filterFormula = `AND({planId} = "${planId}", {sectionName} = "${sectionName}")`
      const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plan%20Sections?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`

      const searchRes = await fetch(searchUrl, {
        // Updated authorization header to use personal access token
        headers: { Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}` },
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
        url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plan%20Sections/${existingRecord.id}`
        method = "PATCH"
      } else {
        url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plan%20Sections`
        method = "POST"
      }

      const res = await fetch(url, {
        method,
        headers: {
          // Updated authorization header to use personal access token
          Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
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

export async function getBusinessPlan(planId: string): Promise<BusinessPlan | null> {
  console.log(`[getBusinessPlan] Attempting to fetch planId: ${planId}`)

  return withLocalFallback(
    async () => {
      const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans/${planId}`, {
        // Updated authorization header to use personal access token
        headers: { Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}` },
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

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  console.log(`[getUserProfile] Fetching profile for: ${email}`)

  return withLocalFallback(
    async () => {
      const filterFormula = `{email} = "${email}"`
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/User%20Profiles?filterByFormula=${encodeURIComponent(
        filterFormula,
      )}&maxRecords=1`

      const res = await fetch(url, {
        // Updated authorization header to use personal access token
        headers: { Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}` },
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
): Promise<UserProfile> {
  return withLocalFallback(
    async () => {
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
          // Updated authorization header to use personal access token
          Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
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
