// Temporary no-op shims – remove once Airtable is fully retired.
export async function getAirtableConnection() {
  return { ok: false, message: "Airtable integration disabled." }
}
export async function getAirtableTables() {
  return []
}
export async function testAirtableQuery() {
  return { ok: false, message: "Airtable integration disabled." }
}
