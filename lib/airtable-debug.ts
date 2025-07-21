/**
 * Legacy Airtable debug helpers – now inert.
 */

export async function getAirtableConnection() {
  return { ok: false, message: "Airtable integration disabled." }
}

export async function getAirtableTables() {
  return []
}

export async function testAirtableQuery() {
  return { ok: false, message: "Airtable integration disabled." }
}
