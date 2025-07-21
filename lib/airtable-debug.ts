/**
 * Stub implementations for Airtable admin/debug helpers.
 */

export async function getAirtableConnection(): Promise<boolean> {
  console.warn("getAirtableConnection() is using a stub implementation.")
  return true
}

export async function getAirtableTables(): Promise<string[]> {
  console.warn("getAirtableTables() is using a stub implementation.")
  return []
}

export async function testAirtableQuery(query: string): Promise<Record<string, unknown>[]> {
  console.warn("testAirtableQuery() is using a stub implementation.")
  return []
}
