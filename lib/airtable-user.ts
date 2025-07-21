import { AirtableClient } from "./airtable"
import type { BusinessPlanSectionRecord } from "./business-plan-sections"

const airtable = new AirtableClient()

/**
 * Mark a section as complete inside Airtable.
 * (Previously added – keeping here so the export remains.)
 */
export async function markBusinessPlanSectionComplete(planId: string, sectionName: string) {
  return airtable.update<BusinessPlanSectionRecord>("Business Plan Sections", {
    planId,
    sectionName,
    isComplete: true,
    completedDate: new Date().toISOString(),
  })
}

/**
 * Update a section while authenticating with the current user’s Airtable
 * credentials. This was the other missing export that broke the build.
 */
export async function updateBusinessPlanSectionWithUserCreds(
  userApiKey: string,
  baseId: string,
  sectionId: string,
  data: Partial<BusinessPlanSectionRecord>,
) {
  const scopedClient = new AirtableClient({ apiKey: userApiKey, baseId })
  return scopedClient.update<BusinessPlanSectionRecord>("Business Plan Sections", sectionId, data)
}
