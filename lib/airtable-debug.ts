/**
 * Deprecated Airtable debug helpers – now just compile-time stubs.
 */
export async function getAirtableConnection() {
  console.warn("getAirtableConnection stub – no Airtable in use")
  return null
}

export async function getAirtableTables() {
  console.warn("getAirtableTables stub – no Airtable in use")
  return []
}

export async function testAirtableQuery() {
  console.warn("testAirtableQuery stub – no Airtable in use")
  return { ok: true }
}
