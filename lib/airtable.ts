/**
 * Temporary stub implementations for Airtable data-access helpers.
 * Replace these with real Airtable SDK / REST calls as needed.
 */

export interface BusinessPlan {
  id: string
  name: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  avatarUrl?: string
}

/**
 * Fetch all business plans for a given user.
 * Currently returns an empty array as a placeholder.
 */
export async function getBusinessPlans(userId: string): Promise<BusinessPlan[]> {
  console.warn("getBusinessPlans() is using a stub implementation.")
  return []
}

/**
 * Create (or update) a user’s profile record.
 * Returns the up-to-date profile object.
 */
export async function createOrUpdateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
  console.warn("createOrUpdateUserProfile() is using a stub implementation.")
  return { id: userId, email: profile.email ?? "example@example.com" }
}

/**
 * Fetch a user profile.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  console.warn("getUserProfile() is using a stub implementation.")
  return null
}

/**
 * Fetch a single business plan by id.
 */
export async function getBusinessPlan(planId: string): Promise<BusinessPlan | null> {
  console.warn("getBusinessPlan() is using a stub implementation.")
  return null
}
