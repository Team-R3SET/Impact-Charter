import type { BusinessPlanSection } from "./airtable"
import { markSectionAsComplete, updateBusinessPlanSection } from "./airtable"
import type { UserSettings } from "./user-settings"

/**
 * Update a Business-Plan section **using the credentials inside the user’s
 * settings** so the operation succeeds even when environment variables are
 * not configured (e.g. on the client or in local-storage mode).
 */
export async function updateBusinessPlanSectionWithUserCreds(
  section: BusinessPlanSection,
  settings: UserSettings | null,
) {
  console.log("[updateBusinessPlanSectionWithUserCreds] section:", section.sectionName, "plan:", section.planId)
  await updateBusinessPlanSection(section, settings)
}

/**
 * Mark a Business-Plan section as complete on behalf of the current user.
 * Thin wrapper over `markSectionAsComplete` so other modules don’t need to
 * import from lib/airtable directly.
 */
export async function markBusinessPlanSectionComplete(
  planId: string,
  sectionName: string,
  userEmail: string,
  settings: UserSettings | null,
) {
  return markSectionAsComplete(planId, sectionName, userEmail, settings)
}
