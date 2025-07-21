/**
 * DEPRECATED – Airtable is being removed.
 * These no-op stubs keep older code compiling during the migration.
 */
export async function getBusinessPlans() {
  console.warn("getBusinessPlans stub called – replace with Supabase logic")
  return []
}

export async function createOrUpdateUserProfile(_profile: unknown) {
  console.warn("createOrUpdateUserProfile stub called – replace with Supabase logic")
  return null
}

export async function getUserProfile(_userId: string) {
  console.warn("getUserProfile stub called – replace with Supabase logic")
  return null
}

export async function getBusinessPlan(_planId: string) {
  console.warn("getBusinessPlan stub called – replace with Supabase logic")
  return null
}
