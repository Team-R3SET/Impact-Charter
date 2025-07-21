/**
 * Airtable integration for business plans and user profiles
 */

export interface BusinessPlan {
  id: string
  name: string
  ownerId: string
  createdAt: string
  updatedAt: string
  sections?: Record<string, any>
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  createdAt?: string
  updatedAt?: string
}

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

/**
 * Fetch all business plans for a given user
 */
export async function getBusinessPlans(userId: string): Promise<BusinessPlan[]> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn("Airtable credentials not configured, returning empty array")
    return []
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans?filterByFormula={Owner}='${userId}'`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`)
    }

    const data = await response.json()
    return (
      data.records?.map((record: any) => ({
        id: record.id,
        name: record.fields.Name || "Untitled Plan",
        ownerId: record.fields.Owner || userId,
        createdAt: record.createdTime,
        updatedAt: record.fields.UpdatedAt || record.createdTime,
        sections: record.fields.Sections || {},
      })) || []
    )
  } catch (error) {
    console.error("Error fetching business plans:", error)
    return []
  }
}

/**
 * Create or update a user profile
 */
export async function createOrUpdateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn("Airtable credentials not configured, returning mock profile")
    return {
      id: userId,
      email: profile.email || "example@example.com",
      name: profile.name || "User",
      createdAt: new Date().toISOString(),
    }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/User%20Profiles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              UserId: userId,
              Email: profile.email,
              Name: profile.name,
              AvatarUrl: profile.avatarUrl,
              UpdatedAt: new Date().toISOString(),
            },
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`)
    }

    const data = await response.json()
    const record = data.records?.[0]

    return {
      id: userId,
      email: record?.fields?.Email || profile.email || "",
      name: record?.fields?.Name || profile.name,
      avatarUrl: record?.fields?.AvatarUrl || profile.avatarUrl,
      createdAt: record?.createdTime,
      updatedAt: record?.fields?.UpdatedAt,
    }
  } catch (error) {
    console.error("Error creating/updating user profile:", error)
    return {
      id: userId,
      email: profile.email || "example@example.com",
      name: profile.name || "User",
    }
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn("Airtable credentials not configured, returning null")
    return null
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/User%20Profiles?filterByFormula={UserId}='${userId}'`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`)
    }

    const data = await response.json()
    const record = data.records?.[0]

    if (!record) return null

    return {
      id: userId,
      email: record.fields.Email,
      name: record.fields.Name,
      avatarUrl: record.fields.AvatarUrl,
      createdAt: record.createdTime,
      updatedAt: record.fields.UpdatedAt,
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

/**
 * Get a single business plan by ID
 */
export async function getBusinessPlan(planId: string): Promise<BusinessPlan | null> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn("Airtable credentials not configured, returning null")
    return null
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans/${planId}`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Airtable API error: ${response.status}`)
    }

    const record = await response.json()

    return {
      id: record.id,
      name: record.fields.Name || "Untitled Plan",
      ownerId: record.fields.Owner,
      createdAt: record.createdTime,
      updatedAt: record.fields.UpdatedAt || record.createdTime,
      sections: record.fields.Sections || {},
    }
  } catch (error) {
    console.error("Error fetching business plan:", error)
    return null
  }
}
