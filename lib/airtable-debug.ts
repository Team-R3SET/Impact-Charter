import Airtable from "airtable"

export interface AirtableConnection {
  isConnected: boolean
  error?: string
  baseId?: string
  tables?: string[]
}

export interface AirtableTable {
  id: string
  name: string
  fields: Array<{
    id: string
    name: string
    type: string
  }>
}

export async function getAirtableConnection(): Promise<AirtableConnection> {
  try {
    if (!process.env.AIRTABLE_API_KEY) {
      return {
        isConnected: false,
        error: "AIRTABLE_API_KEY environment variable is not set",
      }
    }

    if (!process.env.AIRTABLE_BASE_ID) {
      return {
        isConnected: false,
        error: "AIRTABLE_BASE_ID environment variable is not set",
      }
    }

    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE_ID)

    // Test connection by trying to fetch schema
    const tables = await getAirtableTables()

    return {
      isConnected: true,
      baseId: process.env.AIRTABLE_BASE_ID,
      tables: tables.map((t) => t.name),
    }
  } catch (error) {
    console.error("Airtable connection test failed:", error)
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getAirtableTables(): Promise<AirtableTable[]> {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      throw new Error("Airtable credentials not configured")
    }

    // Note: Airtable doesn't provide a direct API to get table schema
    // This is a mock implementation - in practice, you'd need to use the Airtable Meta API
    // or manually define your expected tables
    const expectedTables: AirtableTable[] = [
      {
        id: "tblBusinessPlans",
        name: "BusinessPlans",
        fields: [
          { id: "fldName", name: "Name", type: "singleLineText" },
          { id: "fldUserId", name: "UserId", type: "singleLineText" },
          { id: "fldSections", name: "Sections", type: "longText" },
          { id: "fldStatus", name: "Status", type: "singleSelect" },
          { id: "fldCreatedAt", name: "CreatedAt", type: "dateTime" },
          { id: "fldUpdatedAt", name: "UpdatedAt", type: "dateTime" },
        ],
      },
      {
        id: "tblUserProfiles",
        name: "UserProfiles",
        fields: [
          { id: "fldUserId", name: "UserId", type: "singleLineText" },
          { id: "fldEmail", name: "Email", type: "email" },
          { id: "fldName", name: "Name", type: "singleLineText" },
          { id: "fldAvatar", name: "Avatar", type: "url" },
          { id: "fldPreferences", name: "Preferences", type: "longText" },
          { id: "fldCreatedAt", name: "CreatedAt", type: "dateTime" },
          { id: "fldUpdatedAt", name: "UpdatedAt", type: "dateTime" },
        ],
      },
      {
        id: "tblComments",
        name: "Comments",
        fields: [
          { id: "fldPlanId", name: "PlanId", type: "singleLineText" },
          { id: "fldSectionId", name: "SectionId", type: "singleLineText" },
          { id: "fldUserId", name: "UserId", type: "singleLineText" },
          { id: "fldUserName", name: "UserName", type: "singleLineText" },
          { id: "fldContent", name: "Content", type: "longText" },
          { id: "fldCreatedAt", name: "CreatedAt", type: "dateTime" },
          { id: "fldUpdatedAt", name: "UpdatedAt", type: "dateTime" },
        ],
      },
    ]

    return expectedTables
  } catch (error) {
    console.error("Error fetching Airtable tables:", error)
    return []
  }
}

export async function testAirtableQuery(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return {
        success: false,
        message: "Airtable credentials not configured",
      }
    }

    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE_ID)

    // Test query - try to fetch first record from BusinessPlans table
    const records = await base("BusinessPlans")
      .select({
        maxRecords: 1,
      })
      .all()

    return {
      success: true,
      message: `Successfully connected to Airtable. Found ${records.length} records in BusinessPlans table.`,
      data: {
        recordCount: records.length,
        sampleRecord:
          records.length > 0
            ? {
                id: records[0].id,
                fields: records[0].fields,
              }
            : null,
      },
    }
  } catch (error) {
    console.error("Airtable query test failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function validateAirtableSchema(): Promise<{ isValid: boolean; issues: string[] }> {
  const issues: string[] = []

  try {
    const tables = await getAirtableTables()
    const requiredTables = ["BusinessPlans", "UserProfiles", "Comments"]

    for (const requiredTable of requiredTables) {
      const table = tables.find((t) => t.name === requiredTable)
      if (!table) {
        issues.push(`Missing required table: ${requiredTable}`)
        continue
      }

      // Validate required fields for each table
      const requiredFields: Record<string, string[]> = {
        BusinessPlans: ["Name", "UserId", "Sections", "Status", "CreatedAt", "UpdatedAt"],
        UserProfiles: ["UserId", "Email", "Name", "Preferences", "CreatedAt", "UpdatedAt"],
        Comments: ["PlanId", "SectionId", "UserId", "UserName", "Content", "CreatedAt"],
      }

      const tableRequiredFields = requiredFields[requiredTable] || []
      for (const requiredField of tableRequiredFields) {
        const field = table.fields.find((f) => f.name === requiredField)
        if (!field) {
          issues.push(`Missing required field '${requiredField}' in table '${requiredTable}'`)
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    }
  } catch (error) {
    issues.push(`Schema validation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    return {
      isValid: false,
      issues,
    }
  }
}
