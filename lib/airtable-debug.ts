const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

export interface AirtableTable {
  id: string
  name: string
  primaryFieldId: string
  fields: AirtableField[]
}

export interface AirtableField {
  id: string
  name: string
  type: string
  options?: any
}

export interface AirtableRecord {
  id: string
  fields: Record<string, any>
  createdTime: string
}

export async function testAirtableConnection(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return {
      success: false,
      message: "Missing Airtable API key or Base ID in environment variables",
      details: {
        hasApiKey: !!AIRTABLE_API_KEY,
        hasBaseId: !!AIRTABLE_BASE_ID,
      },
    }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "X-Airtable-Accept-Meta-Api-Betas": "true",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          message: "Base not found - check your AIRTABLE_BASE_ID",
          details: {
            status: response.status,
            baseId: AIRTABLE_BASE_ID,
          },
        }
      }

      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
        },
      }
    }

    const data = await response.json()
    return {
      success: true,
      message: "Connection successful",
      details: {
        tablesCount: data.tables?.length || 0,
        baseId: AIRTABLE_BASE_ID,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: { error: String(error) },
    }
  }
}

export async function getAirtableTables(): Promise<AirtableTable[]> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn("Missing Airtable credentials")
    return []
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "X-Airtable-Accept-Meta-Api-Betas": "true",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.warn("Airtable base not found - returning empty tables list")
        return []
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.tables || []
  } catch (error) {
    console.error("Error fetching Airtable tables:", error)
    return []
  }
}

export async function getAirtableRecords(tableId: string, maxRecords = 10): Promise<AirtableRecord[]> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return []
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}?maxRecords=${maxRecords}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.records || []
  } catch (error) {
    console.error("Error fetching Airtable records:", error)
    return []
  }
}

export async function createAirtableRecord(
  tableId: string,
  fields: Record<string, any>,
): Promise<{ success: boolean; record?: AirtableRecord; error?: string }> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return { success: false, error: "Missing Airtable credentials" }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorData.error?.message || response.statusText}`,
      }
    }

    const record = await response.json()
    return { success: true, record }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updateAirtableRecord(
  tableId: string,
  recordId: string,
  fields: Record<string, any>,
): Promise<{ success: boolean; record?: AirtableRecord; error?: string }> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return { success: false, error: "Missing Airtable credentials" }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorData.error?.message || response.statusText}`,
      }
    }

    const record = await response.json()
    return { success: true, record }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteAirtableRecord(
  tableId: string,
  recordId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return { success: false, error: "Missing Airtable credentials" }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorData.error?.message || response.statusText}`,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
