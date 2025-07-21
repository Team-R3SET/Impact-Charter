/**
 * Debug utilities for Airtable connection testing
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

/**
 * Test Airtable connection
 */
export async function getAirtableConnection(): Promise<boolean> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error("Missing Airtable credentials")
    return false
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    return response.ok
  } catch (error) {
    console.error("Airtable connection test failed:", error)
    return false
  }
}

/**
 * Get list of tables in the base
 */
export async function getAirtableTables(): Promise<string[]> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error("Missing Airtable credentials")
    return []
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`)
    }

    const data = await response.json()
    return data.tables?.map((table: any) => table.name) || []
  } catch (error) {
    console.error("Error fetching Airtable tables:", error)
    return []
  }
}

/**
 * Test a query against Airtable
 */
export async function testAirtableQuery(tableName: string): Promise<Record<string, unknown>[]> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error("Missing Airtable credentials")
    return []
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?maxRecords=5`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`)
    }

    const data = await response.json()
    return (
      data.records?.map((record: any) => ({
        id: record.id,
        fields: record.fields,
        createdTime: record.createdTime,
      })) || []
    )
  } catch (error) {
    console.error("Error testing Airtable query:", error)
    return []
  }
}
