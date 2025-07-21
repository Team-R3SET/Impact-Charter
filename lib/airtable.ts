/**
 * 🛑  Airtable has been retired.  These no-op stubs only satisfy
 * TypeScript and the bundler until all code paths are migrated.
 */

export async function getBusinessPlans(/* userId: string */) {
  return []
}

export async function getBusinessPlan(/* planId: string */) {
  return null
}

export async function createOrUpdateUserProfile(/* profile */) {
  return { ok: false, message: "Airtable disabled" }
}

export async function getUserProfile(/* userId: string */) {
  return null
}
