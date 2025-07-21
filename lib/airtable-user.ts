/**
 * Airtable-related helpers.
 *
 * In production you’d call the Airtable REST API.
 * In the demo we just log the intent so the functions exist.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type UpdateArgs = {
  planId: string
  sectionName: string
  completedBy: string
  isComplete: boolean
}

type Creds = { apiKey?: string; baseId?: string }

/* ------------------------------------------------------------------ */
/*  Low-level helper                                                   */
/* ------------------------------------------------------------------ */

/**
 * Update a single Business-Plan section using the current user’s
 * Airtable credentials.
 */
export async function updateBusinessPlanSectionWithUserCreds(
  args: UpdateArgs,
  { apiKey, baseId }: Creds = {},
): Promise<void> {
  // If real credentials are missing just resolve immediately.
  if (!apiKey || !baseId) {
    console.log("(demo) updateBusinessPlanSectionWithUserCreds", args)
    return
  }

  // Real implementation (commented-out stub):
  /*
  await fetch(`https://api.airtable.com/v0/${baseId}/Business%20Plan%20Sections`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        planId: args.planId,
        sectionName: args.sectionName,
        completedBy: args.completedBy,
        isComplete: args.isComplete,
      },
    }),
  })
  */
  console.log("(stub) would update Airtable with", args)
}

/* ------------------------------------------------------------------ */
/*  Higher-level convenience helper                                    */
/* ------------------------------------------------------------------ */

/**
 * Convenience wrapper to mark a section complete / incomplete that
 * simply delegates to `updateBusinessPlanSectionWithUserCreds`.
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
