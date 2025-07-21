/**
 * Convenience wrapper that marks a single section complete / incomplete
 * for the current user. Falls back to console-logging in the demo.
 */
export async function markBusinessPlanSectionComplete(
  planId: string,
  sectionName: string,
  completedBy: string,
  isComplete = true,
  creds: Creds = {},
): Promise<void> {
  await updateBusinessPlanSectionWithUserCreds({ planId, sectionName, completedBy, isComplete }, creds)
}
