const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

export interface AirtableUser {
  id?: string
  email: string
  name: string
  role: "administrator" | "regular"
  isActive: boolean
  lastLoginDate?: string
  createdDate: string
  lastModified: string
}

export async function getAirtableUser(email: string): Promise<AirtableUser | null> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return {
      id: "local-user",
      email,
      name: "Demo User",
      role: "administrator",
      isActive: true,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }
  }

  try {
    const filterFormula = `{email} = "${email}"`
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Users?filterByFormula=${encodeURIComponent(
      filterFormula,
    )}&maxRecords=1`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      cache: "no-store",
    })

    if (!res.ok) return null

    const data = await res.json()
    if (!Array.isArray(data.records) || data.records.length === 0) {
      return null
    }

    const record = data.records[0]
    return { id: record.id, ...record.fields }
  } catch (error) {
    console.error("Error fetching Airtable user:", error)
    return null
  }
}

/** Information required to mark a section complete. */
interface SectionCompleteInfo {
  planId: string
  sectionName: string
  completedBy: string
  completedAt?: string
}

/**
 * Mark a business-plan section as complete in Airtable.
 * Accepts EITHER the original 3-string signature
 *   markBusinessPlanSectionComplete(planId, sectionName, userEmail)
 * OR the newer object signature used by the route handler:
 *   markBusinessPlanSectionComplete({ planId, sectionName, completedBy }, userEmail?)
 */
export async function markBusinessPlanSectionComplete(
  infoOrPlanId: SectionCompleteInfo | string,
  sectionNameOrUserEmail?: string,
  maybeUserEmail?: string,
): Promise<void> {
  // -------- parameter normalisation --------
  let planId: string
  let sectionName: string
  let userEmail: string

  if (typeof infoOrPlanId === "object") {
    planId = infoOrPlanId.planId
    sectionName = infoOrPlanId.sectionName
    userEmail =
      infoOrPlanId.completedBy || (typeof sectionNameOrUserEmail === "string" ? sectionNameOrUserEmail : "") || ""
  } else {
    planId = infoOrPlanId
    sectionName = sectionNameOrUserEmail as string
    userEmail = maybeUserEmail as string
  }

  if (!planId || !sectionName || !userEmail) {
    throw new Error("markBusinessPlanSectionComplete: missing parameters")
  }

  // -------- (rest of the function stays the same) --------

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.log("Airtable API keys missing - operation completed locally")
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

    console.log(`Successfully marked section ${sectionName} as complete`)
  } catch (error) {
    console.error("Error marking section as complete:", error)
    throw error
  }
}
