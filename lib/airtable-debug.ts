import type { UserSettings } from "./user-settings"

export interface AirtableTable {
  id: string
  name: string
  primaryFieldId: string
  fields: AirtableField[]
  views: { id: string; name: string; type: string }[]
}

export interface AirtableField {
  id: string
  name: string
  type: string
  description?: string
  options?: any
}

export interface AirtableConnection {
  isConnected: boolean
  hasApiKey: boolean
  baseId: string | null
  error?: string
}

export interface AirtableTestResult {
  success: boolean
  status: number
  responseTime: number
  data?: any
  error?: string
  timestamp: string
}

export async function getAirtableConnection(settings: UserSettings | null): Promise<AirtableConnection> {
  const apiKey = settings?.airtableApiKey
  const baseId = settings?.airtableBaseId

  if (!apiKey || !baseId) {
    return {
      isConnected: false,
      hasApiKey: !!apiKey,
      baseId: baseId || null,
      error: "Missing Airtable API Key or Base ID.",
    }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || `Airtable API error: ${response.status}`
      throw new Error(errorMessage)
    }

    return {
      isConnected: true,
      hasApiKey: true,
      baseId: baseId,
    }
  } catch (error) {
    return {
      isConnected: false,
      hasApiKey: !!apiKey,
      baseId: baseId,
      error: error instanceof Error ? error.message : "Unknown connection error",
    }
  }
}

export async function getAirtableTables(settings: UserSettings | null): Promise<AirtableTable[]> {
  const apiKey = settings?.airtableApiKey
  const baseId = settings?.airtableBaseId
  if (!apiKey || !baseId) return []

  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!response.ok) {
      console.error(`Error fetching Airtable tables: HTTP ${response.status}: ${response.statusText}`)
      return []
    }

    const data = await response.json()
    return data.tables || []
  } catch (error) {
    console.error("Error fetching Airtable tables:", error)
    return []
  }
}

export async function testAirtableQuery(
  tableName: string,
  options: any = {},
  settings: UserSettings | null,
): Promise<AirtableTestResult> {
  const apiKey = settings?.airtableApiKey
  const baseId = settings?.airtableBaseId
  const startTime = Date.now()

  if (!apiKey || !baseId) {
    return {
      success: false,
      status: 400,
      responseTime: 0,
      error: "Missing Airtable credentials.",
      timestamp: new Date().toISOString(),
    }
  }

  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`)
  if (options.filterFormula) url.searchParams.append("filterByFormula", options.filterFormula)
  if (options.maxRecords) url.searchParams.append("maxRecords", options.maxRecords.toString())
  if (options.fields) url.searchParams.append("fields[]", options.fields)

  try {
    const response = await fetch(url.toString(), {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: options.data ? JSON.stringify({ fields: options.data }) : undefined,
    })

    const responseTime = Date.now() - startTime
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        responseTime,
        error: data.error?.message || `HTTP ${response.status}`,
        data,
        timestamp: new Date().toISOString(),
      }
    }

    return {
      success: true,
      status: response.status,
      responseTime,
      data,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      success: false,
      status: 0,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown test error",
      timestamp: new Date().toISOString(),
    }
  }
}
