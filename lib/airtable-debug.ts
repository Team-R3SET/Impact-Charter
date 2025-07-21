/**
 * Debug utilities for Airtable connection testing
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

/**
 * Test Airtable connection
 */
export async function getAirtableConnection(settings: any): Promise<{ isConnected: boolean; error?: string }> {
  const AIRTABLE_API_KEY = settings.airtableApiKey || process.env.AIRTABLE_API_KEY
  const AIRTABLE_BASE_ID = settings.airtableBaseId || process.env.AIRTABLE_BASE_ID

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return { isConnected: false, error: "Missing Airtable credentials" }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    return { isConnected: response.ok, error: response.ok ? undefined : `HTTP ${response.status}` }
  } catch (error) {
    console.error("Airtable connection test failed:", error)
    return { isConnected: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Get list of tables in the base
 */
export async function getAirtableTables(settings: any): Promise<string[]> {
  const AIRTABLE_API_KEY = settings.airtableApiKey || process.env.AIRTABLE_API_KEY
  const AIRTABLE_BASE_ID = settings.airtableBaseId || process.env.AIRTABLE_BASE_ID

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
export async function testAirtableQuery(tableName: string, options: any, settings: any): Promise<any> {
  const AIRTABLE_API_KEY = settings.airtableApiKey || process.env.AIRTABLE_API_KEY
  const AIRTABLE_BASE_ID = settings.airtableBaseId || process.env.AIRTABLE_BASE_ID

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return {
      success: false,
      status: 0,
      error: "Missing Airtable credentials",
      responseTime: 0,
      timestamp: new Date().toISOString(),
    }
  }

  const startTime = Date.now()

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

    const responseTime = Date.now() - startTime
    const data = await response.json()

    return {
      success: response.ok,
      status: response.status,
      data: response.ok ? data.records?.slice(0, 3) : undefined,
      error: response.ok ? undefined : data.error?.message || `HTTP ${response.status}`,
      responseTime,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime,
      timestamp: new Date().toISOString(),
    }
  }
}
