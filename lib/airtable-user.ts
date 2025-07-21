/**
 * Update a business-plan section using explicit Airtable credentials.
 * Falls back to local logging when no credentials are available.
 */
export async function updateBusinessPlanSectionWithUserCreds(
  {
    planId,
    sectionName,
    isComplete,
    completedBy,
  }: {
    planId: string
    sectionName: string
    isComplete: boolean
    completedBy: string
  },
  {
    apiKey,
    baseId,
  }: {
    apiKey?: string
    baseId?: string
  } = {},
): Promise<void> {
  const key = apiKey ?? process.env.AIRTABLE_API_KEY
  const base = baseId ?? process.env.AIRTABLE_BASE_ID

  // Local fallback / demo mode
  if (!key || !base) {
    console.log(`(demo) update section – plan:${planId} section:${sectionName} complete:${isComplete}`)
    return
  }

  // Basic implementation: patch the first matching record
  const filter = `AND({planId} = "${planId}", {sectionName} = "${sectionName}")`
  const url = `https://api.airtable.com/v0/${base}/Business%20Plan%20Sections`
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }

  const search = await fetch(`${url}?filterByFormula=${encodeURIComponent(filter)}&maxRecords=1`, {
    headers,
    cache: "no-store",
  }).then((r) => r.json())

  const record = search.records?.[0]
  if (!record) return

  await fetch(`${url}/${record.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ fields: { isComplete } }),
  })
}
