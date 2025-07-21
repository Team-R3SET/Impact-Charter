import { getUserSettings } from "./user-settings"

export interface UserAirtableCredentials {
  apiKey: string
  baseId: string
}

export async function getUserAirtableCredentials(userEmail: string): Promise<UserAirtableCredentials | null> {
  try {
    console.log(`[getUserAirtableCredentials] Fetching credentials for: ${userEmail}`)
    const settings = await getUserSettings(userEmail)

    if (settings?.airtableApiKey && settings?.airtableBaseId) {
      console.log(`[getUserAirtableCredentials] Found credentials for: ${userEmail}`)
      return {
        apiKey: settings.airtableApiKey,
        baseId: settings.airtableBaseId,
      }
    }

    console.log(`[getUserAirtableCredentials] No credentials found for: ${userEmail}`)
    return null
  } catch (error) {
    console.error("[getUserAirtableCredentials] Error fetching user credentials:", error)
    return null
  }
}

export async function testUserAirtableConnection(apiKey: string, baseId: string): Promise<boolean> {
  try {
    console.log(`[testUserAirtableConnection] Testing connection to base: ${baseId}`)
    const response = await fetch(`https://api.airtable.com/v0/${baseId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const isConnected = response.ok
    console.log(`[testUserAirtableConnection] Connection test result: ${isConnected}`)
    return isConnected
  } catch (error) {
    console.error("[testUserAirtableConnection] Connection test failed:", error)
    return false
  }
}

export async function updateBusinessPlanSectionWithUserCreds(
  section: {
    id?: string
    planId: string
    sectionName: string
    sectionContent: string
    lastModified: string
    modifiedBy: string
    isComplete?: boolean
    submittedForReview?: boolean
    completedDate?: string
  },
  userEmail: string,
): Promise<void> {
  console.log(`[updateBusinessPlanSectionWithUserCreds] Starting update for section: ${section.sectionName}`)

  const credentials = await getUserAirtableCredentials(userEmail)

  if (!credentials) {
    console.log("[updateBusinessPlanSectionWithUserCreds] No user credentials - skipping remote update")
    return
  }

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
    console.log(`[updateBusinessPlanSectionWithUserCreds] Creating new record for section: ${section.sectionName}`)

    try {
      const createRes = await fetch(`https://api.airtable.com/v0/${credentials.baseId}/Business%20Plan%20Sections`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      })

      if (!createRes.ok) {
        const errorText = await createRes.text()
        console.warn(`[updateBusinessPlanSectionWithUserCreds] Create failed: ${createRes.status} – ${errorText}`)

        // Check if it's a table not found error
        if (createRes.status === 404) {
          throw new Error(
            "Business Plan Sections table not found in your Airtable base. Please create the table or check your base ID.",
          )
        } else if (createRes.status === 401) {
          throw new Error("Invalid Airtable API key. Please check your credentials in Settings.")
        } else if (createRes.status === 403) {
          throw new Error("Permission denied. Please check your Airtable API key permissions.")
        } else {
          throw new Error(`Airtable error (${createRes.status}): ${errorText}`)
        }
      }

      console.log(
        `[updateBusinessPlanSectionWithUserCreds] Successfully created record for section: ${section.sectionName}`,
      )
    } catch (error) {
      console.error(`[updateBusinessPlanSectionWithUserCreds] Create error:`, error)
      throw error
    }
  }

  // If we have a section ID, try to update first
  if (section.id) {
    try {
      console.log(`[updateBusinessPlanSectionWithUserCreds] Updating existing record: ${section.id}`)

      const patchRes = await fetch(
        `https://api.airtable.com/v0/${credentials.baseId}/Business%20Plan%20Sections/${section.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${credentials.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields }),
        },
      )

      if (patchRes.status === 404) {
        console.warn(`[updateBusinessPlanSectionWithUserCreds] Record ${section.id} not found – creating new one`)
        await createRecord()
        return
      }

      if (!patchRes.ok) {
        const errorText = await patchRes.text()
        console.warn(`[updateBusinessPlanSectionWithUserCreds] Update failed: ${patchRes.status} – ${errorText}`)

        if (patchRes.status === 401) {
          throw new Error("Invalid Airtable API key. Please check your credentials in Settings.")
        } else if (patchRes.status === 403) {
          throw new Error("Permission denied. Please check your Airtable API key permissions.")
        } else {
          throw new Error(`Airtable error (${patchRes.status}): ${errorText}`)
        }
      }

      console.log(`[updateBusinessPlanSectionWithUserCreds] Successfully updated record: ${section.id}`)
      return
    } catch (error) {
      console.warn("[updateBusinessPlanSectionWithUserCreds] Update error:", error)
      throw error
    }
  }

  // No section ID, create new record
  await createRecord()
}

export async function markSectionAsCompleteWithUserCreds(
  planId: string,
  sectionName: string,
  userEmail: string,
): Promise<void> {
  console.log(`[markSectionAsCompleteWithUserCreds] Marking section ${sectionName} as complete for plan ${planId}`)

  const credentials = await getUserAirtableCredentials(userEmail)

  if (!credentials) {
    console.log("[markSectionAsCompleteWithUserCreds] No user credentials - operation completed locally")
    return
  }

  try {
    // First, try to find existing section record
    const filterFormula = `AND({planId} = "${planId}", {sectionName} = "${sectionName}")`
    const searchUrl = `https://api.airtable.com/v0/${credentials.baseId}/Business%20Plan%20Sections?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${credentials.apiKey}` },
      cache: "no-store",
    })

    if (!searchRes.ok) {
      const errorText = await searchRes.text()
      throw new Error(`Failed to search for section: ${searchRes.status} - ${errorText}`)
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
      sectionContent: existingRecord?.fields?.sectionContent || "", // Preserve existing content
    }

    let url: string
    let method: string

    if (existingRecord) {
      // Update existing record
      url = `https://api.airtable.com/v0/${credentials.baseId}/Business%20Plan%20Sections/${existingRecord.id}`
      method = "PATCH"
    } else {
      // Create new record
      url = `https://api.airtable.com/v0/${credentials.baseId}/Business%20Plan%20Sections`
      method = "POST"
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: updateData }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Airtable operation failed: ${res.status} - ${errorText}`)
    }

    console.log(`[markSectionAsCompleteWithUserCreds] Successfully marked section ${sectionName} as complete`)
  } catch (error) {
    console.error("[markSectionAsCompleteWithUserCreds] Error marking section as complete:", error)
    throw error
  }
}

/**
 * Wrapper expected by older code.  Internally delegates to the
 * credential-aware helper already defined in this module.
 */
export async function markBusinessPlanSectionComplete(
  planId: string,
  sectionName: string,
  userEmail: string,
): Promise<void> {
  return markSectionAsCompleteWithUserCreds(planId, sectionName, userEmail)
}
