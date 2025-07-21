/**
 * User-specific Airtable operations for business plan sections
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

/**
 * Update a business plan section with user credentials
 */
export async function updateBusinessPlanSectionWithUserCreds(
  planId: string,
  sectionName: string,
  userId: string,
  content: unknown,
): Promise<void> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn("Airtable credentials not configured, skipping update")
    return
  }

  try {
    // First, get the current plan
    const planResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans/${planId}`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!planResponse.ok) {
      throw new Error(`Failed to fetch plan: ${planResponse.status}`)
    }

    const plan = await planResponse.json()
    const currentSections = plan.fields.Sections || {}

    // Update the specific section
    const updatedSections = {
      ...currentSections,
      [sectionName]: {
        content,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
      },
    }

    // Update the plan
    const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans/${planId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Sections: updatedSections,
          UpdatedAt: new Date().toISOString(),
        },
      }),
    })

    if (!updateResponse.ok) {
      throw new Error(`Failed to update plan: ${updateResponse.status}`)
    }
  } catch (error) {
    console.error("Error updating business plan section:", error)
    throw error
  }
}

/**
 * Mark a business plan section as complete
 */
export async function markBusinessPlanSectionComplete(
  planId: string,
  sectionName: string,
  userId: string,
): Promise<void> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn("Airtable credentials not configured, skipping completion mark")
    return
  }

  try {
    // First, get the current plan
    const planResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans/${planId}`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!planResponse.ok) {
      throw new Error(`Failed to fetch plan: ${planResponse.status}`)
    }

    const plan = await planResponse.json()
    const currentSections = plan.fields.Sections || {}
    const currentSection = currentSections[sectionName] || {}

    // Mark section as complete
    const updatedSections = {
      ...currentSections,
      [sectionName]: {
        ...currentSection,
        completed: true,
        completedBy: userId,
        completedAt: new Date().toISOString(),
      },
    }

    // Update the plan
    const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans/${planId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Sections: updatedSections,
          UpdatedAt: new Date().toISOString(),
        },
      }),
    })

    if (!updateResponse.ok) {
      throw new Error(`Failed to mark section complete: ${updateResponse.status}`)
    }
  } catch (error) {
    console.error("Error marking business plan section complete:", error)
    throw error
  }
}
