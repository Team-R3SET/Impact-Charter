const AIRTABLE_PERSONAL_ACCESS_TOKEN = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

export interface AirtableConnection {
  isConnected: boolean
  baseId?: string
  hasApiKey: boolean
  lastTested?: string
  error?: string
}

export interface AirtableTestResult {
  success: boolean
  message: string
  details?: any
  timestamp: string
}

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

export async function getAirtableConnection(): Promise<AirtableConnection> {
  const hasApiKey = !!AIRTABLE_PERSONAL_ACCESS_TOKEN
  const baseId = AIRTABLE_BASE_ID

  if (!hasApiKey || !baseId) {
    return {
      isConnected: false,
      hasApiKey,
      baseId,
      error: "Missing personal access token or Base ID"
    }
  }

  try {
    const testResult = await testAirtableConnection()
    return {
      isConnected: testResult.success,
      hasApiKey,
      baseId,
      lastTested: new Date().toISOString(),
      error: testResult.success ? undefined : testResult.message
    }
  } catch (error) {
    return {
      isConnected: false,
      hasApiKey,
      baseId,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

export async function testAirtableQuery(tableName: string = "Users"): Promise<AirtableTestResult> {
  const timestamp = new Date().toISOString()
  
  if (!AIRTABLE_PERSONAL_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
    return {
      success: false,
      message: "Missing Airtable credentials",
      timestamp,
      details: {
        hasApiKey: !!AIRTABLE_PERSONAL_ACCESS_TOKEN,
        hasBaseId: !!AIRTABLE_BASE_ID
      }
    }
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?maxRecords=1`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      return {
        success: false,
        message: `Query failed: ${response.status} ${response.statusText}`,
        timestamp,
        details: {
          status: response.status,
          tableName
        }
      }
    }

    const data = await response.json()
    return {
      success: true,
      message: "Query successful",
      timestamp,
      details: {
        recordCount: data.records?.length || 0,
        tableName
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Query error: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp,
      details: { error: String(error) }
    }
  }
}

export async function testAirtableConnection(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  if (!AIRTABLE_PERSONAL_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
    return {
      success: false,
      message: "Missing Airtable personal access token or Base ID in environment variables",
      details: {
        hasApiKey: !!AIRTABLE_PERSONAL_ACCESS_TOKEN,
        hasBaseId: !!AIRTABLE_BASE_ID,
      },
    }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
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
  if (!AIRTABLE_PERSONAL_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
    console.warn("Missing Airtable credentials")
    return []
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
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
  if (!AIRTABLE_PERSONAL_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
    return []
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}?maxRecords=${maxRecords}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
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
  if (!AIRTABLE_PERSONAL_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
    return { success: false, error: "Missing Airtable credentials" }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
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
  if (!AIRTABLE_PERSONAL_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
    return { success: false, error: "Missing Airtable credentials" }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
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
  if (!AIRTABLE_PERSONAL_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
    return { success: false, error: "Missing Airtable credentials" }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
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
