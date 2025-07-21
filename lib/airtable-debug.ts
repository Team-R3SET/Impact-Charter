const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

export interface AirtableTable {
  id: string
  name: string
  primaryFieldId: string
  fields: AirtableField[]
  views: AirtableView[]
}

export interface AirtableField {
  id: string
  name: string
  type: string
  options?: Record<string, any>
  description?: string
}

export interface AirtableView {
  id: string
  name: string
  type: string
}

export interface AirtableTestResult {
  success: boolean
  status: number
  data?: any
  error?: string
  responseTime: number
  timestamp: string
}

export interface AirtableConnection {
  isConnected: boolean
  baseId?: string
  hasApiKey: boolean
  error?: string
}

export async function getAirtableConnection(): Promise<AirtableConnection> {
  if (!AIRTABLE_API_KEY) {
    return {
      isConnected: false,
      hasApiKey: false,
      error: "AIRTABLE_API_KEY environment variable is not set",
    }
  }

  if (!AIRTABLE_BASE_ID) {
    return {
      isConnected: false,
      hasApiKey: true,
      error: "AIRTABLE_BASE_ID environment variable is not set",
    }
  }

  try {
    const startTime = Date.now()
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "X-Airtable-Accept-Meta-Api-Betas": "enterprise-meta",
      },
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      return {
        isConnected: false,
        hasApiKey: true,
        baseId: AIRTABLE_BASE_ID,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    return {
      isConnected: true,
      hasApiKey: true,
      baseId: AIRTABLE_BASE_ID,
    }
  } catch (error) {
    return {
      isConnected: false,
      hasApiKey: true,
      baseId: AIRTABLE_BASE_ID,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getAirtableTables(): Promise<AirtableTable[]> {
  // Fast-fail if creds are missing
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return []
  }

  const url = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        // The meta API is GA but still expects this header in some regions.
        "X-Airtable-Accept-Meta-Api-Betas": "enterprise-meta",
      },
    })

    // --- Graceful fallback on 404 ---
    if (response.status === 404) {
      console.warn(
        `[airtable-debug] Base ${AIRTABLE_BASE_ID} not found (404). Returning empty table list so UI can render.`,
      )
      return []
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.tables || []
  } catch (err) {
    console.error("[airtable-debug] Error fetching Airtable tables:", err)
    // Any other error: return empty list so the UI still loads
    return []
  }
}

export async function testAirtableQuery(
  tableName: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE"
    filterFormula?: string
    fields?: string[]
    maxRecords?: number
    sort?: Array<{ field: string; direction: "asc" | "desc" }>
    recordId?: string
    data?: Record<string, any>
  } = {},
): Promise<AirtableTestResult> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return {
      success: false,
      status: 0,
      error: "Airtable credentials not configured",
      responseTime: 0,
      timestamp: new Date().toISOString(),
    }
  }

  const startTime = Date.now()
  const method = options.method || "GET"

  try {
    let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`

    if (options.recordId) {
      url += `/${options.recordId}`
    }

    const queryParams = new URLSearchParams()

    if (options.filterFormula) {
      queryParams.append("filterByFormula", options.filterFormula)
    }

    if (options.fields && options.fields.length > 0) {
      options.fields.forEach((field) => queryParams.append("fields[]", field))
    }

    if (options.maxRecords) {
      queryParams.append("maxRecords", options.maxRecords.toString())
    }

    if (options.sort && options.sort.length > 0) {
      options.sort.forEach((sort, index) => {
        queryParams.append(`sort[${index}][field]`, sort.field)
        queryParams.append(`sort[${index}][direction]`, sort.direction)
      })
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`
    }

    const requestOptions: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    }

    if (options.data && (method === "POST" || method === "PATCH")) {
      requestOptions.body = JSON.stringify({ fields: options.data })
    }

    const response = await fetch(url, requestOptions)
    const responseTime = Date.now() - startTime

    let data
    try {
      data = await response.json()
    } catch {
      data = await response.text()
    }

    return {
      success: response.ok,
      status: response.status,
      data,
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

export async function getTableRecords(
  tableName: string,
  options: {
    maxRecords?: number
    filterFormula?: string
  } = {},
): Promise<AirtableTestResult> {
  return testAirtableQuery(tableName, {
    method: "GET",
    maxRecords: options.maxRecords || 10,
    filterFormula: options.filterFormula,
  })
}

export function getFieldTypeDescription(fieldType: string): string {
  const descriptions: Record<string, string> = {
    singleLineText: "Single line of text",
    email: "Email address",
    url: "URL/Link",
    multilineText: "Long text with line breaks",
    number: "Numeric value",
    percent: "Percentage (0-1)",
    currency: "Currency amount",
    singleSelect: "Single choice from predefined options",
    multipleSelects: "Multiple choices from predefined options",
    date: "Date only",
    dateTime: "Date and time",
    phoneNumber: "Phone number",
    attachment: "File attachments",
    checkbox: "True/false checkbox",
    formula: "Calculated field based on other fields",
    createdTime: "Automatically set creation timestamp",
    rollup: "Summary of linked record values",
    count: "Count of linked records",
    lookup: "Value from linked records",
    multipleLookupValues: "Multiple values from linked records",
    autoNumber: "Automatically incrementing number",
    barcode: "Barcode scanner input",
    rating: "Star rating (1-10)",
    richText: "Formatted text with styling",
    duration: "Time duration",
    lastModifiedTime: "Automatically updated timestamp",
    button: "Action button",
    multipleRecordLinks: "Links to records in other tables",
  }

  return descriptions[fieldType] || `Unknown field type: ${fieldType}`
}
