import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { airtablePersonalAccessToken, airtableBaseId } = await request.json()

    if (!airtablePersonalAccessToken || !airtableBaseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Both Personal Access Token and Base ID are required",
        },
        { status: 400 },
      )
    }

    // Test the connection by fetching base metadata
    try {
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${airtableBaseId}/tables`, {
        headers: {
          Authorization: `Bearer ${airtablePersonalAccessToken}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          return NextResponse.json({
            success: false,
            message: "Invalid Personal Access Token. Please check your Airtable personal access token.",
          })
        } else if (response.status === 403) {
          return NextResponse.json({
            success: false,
            message: "Access forbidden. Please ensure your Personal Access Token has 'data.records:read' and 'data.records:write' scopes, and that you have access to this base.",
            errorCode: "INSUFFICIENT_PERMISSIONS",
            troubleshooting: [
              "Verify your token has the required scopes: data.records:read and data.records:write",
              "Ensure you have access to the specified base",
              "Check that the Base ID is correct (starts with 'app')",
              "Try creating a new personal access token with proper permissions"
            ]
          })
        } else if (response.status === 404) {
          return NextResponse.json({
            success: false,
            message: "Base not found. Please check your Base ID.",
          })
        } else {
          return NextResponse.json({
            success: false,
            message: `Connection failed with status ${response.status}`,
          })
        }
      }

      const data = await response.json()
      const tables = data.tables?.map((table: any) => table.name) || []

      const requiredTables = ["Business Plans", "Business Plan Sections", "User Profiles"]
      const missingTables = requiredTables.filter(table => !tables.includes(table))

      if (missingTables.length > 0) {
        return NextResponse.json({
          success: false,
          message: `Connection successful, but required tables are missing: ${missingTables.join(", ")}`,
          errorCode: "MISSING_TABLES",
          missingTables,
          existingTables: tables,
          troubleshooting: [
            "Create the missing tables in your Airtable base:",
            ...missingTables.map(table => `• ${table}`),
            "",
            "Required table structures:",
            "• Business Plans: Name (Single line text), Description (Long text), CreatedBy (Single line text), CreatedAt (Date), UpdatedAt (Date)",
            "• Business Plan Sections: PlanId (Single line text), SectionName (Single line text), Content (Long text), IsComplete (Checkbox), CompletedBy (Single line text), CompletedAt (Date)",
            "• User Profiles: Email (Single line text), Name (Single line text), Role (Single select), CreatedAt (Date)"
          ]
        })
      }

      return NextResponse.json({
        success: true,
        message: "Connection successful! All required tables found.",
        baseInfo: {
          name: data.tables?.[0]?.name || "Unknown",
          tables,
          requiredTables,
        },
      })
    } catch (fetchError) {
      console.error("Airtable connection test failed:", fetchError)
      return NextResponse.json({
        success: false,
        message: "Failed to connect to Airtable. Please check your credentials.",
      })
    }
  } catch (error) {
    console.error("Test connection error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
