import { getUserSettings } from "./user-settings"

export interface UserAirtableCredentials {
  apiKey: string
  baseId: string
}

export async function getUserAirtableCredentials(userEmail: string): Promise<UserAirtableCredentials | null> {
  try {
    const settings = await getUserSettings(userEmail)
    if (settings?.airtableApiKey && settings?.airtableBaseId) {
      return {
        apiKey: settings.airtableApiKey,
        baseId: settings.airtableBaseId,
      }
    }
    return null
  } catch (error) {
    console.error("[getUserAirtableCredentials] Error fetching user credentials:", error)
    return null
  }
}

export async function testUserAirtableConnection(apiKey: string, baseId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    return response.ok
  } catch (error) {
    console.error("[testUserAirtableConnection] Connection test failed:", error)
    return false
  }
}

// Updated Airtable functions that use user credentials
export async function createBusinessPlanWithUserCreds(
  plan: Omit<import("./airtable").BusinessPlan, "id">,
  userEmail: string,
): Promise<import("./airtable").BusinessPlan> {
  const credentials = await getUserAirtableCredentials(userEmail)

  if (!credentials) {
    // Fallback to local mode
    return {
      id: crypto.randomUUID(),
      ...plan,
    }
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

    if (!res.ok) {
      console.warn("Airtable create failed, using local fallback")
      return { id: crypto.randomUUID(), ...plan }
    }

    const data = await res.json()
    return { id: data.id, ...data.fields }
  } catch (error) {
    console.warn("Airtable unreachable, using local fallback:", error)
    return { id: crypto.randomUUID(), ...plan }
  }
}

export async function updateBusinessPlanSectionWithUserCreds(
  section: import("./airtable").BusinessPlanSection,
  userEmail: string,
): Promise<void> {
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
    const createRes = await fetch(`https://api.airtable.com/v0/${credentials.baseId}/Business%20Plan%20Sections`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    })

    if (!createRes.ok) {
      const txt = await createRes.text()
      console.warn(`[updateBusinessPlanSectionWithUserCreds] Create failed: ${createRes.status} – ${txt}`)
      // Don't throw - just log and continue
      return
    }
  }

  // If we have a section ID, try to update first
  if (section.id) {
    try {
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
        const txt = await patchRes.text()
        console.warn(`[updateBusinessPlanSectionWithUserCreds] Update failed: ${patchRes.status} – ${txt}`)
        return
      }
      return
    } catch (error) {
      console.warn("[updateBusinessPlanSectionWithUserCreds] Update error:", error)
      return
    }
  }

  // No section ID, create new record
  await createRecord()
}
