import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { airtableApiKey, airtableBaseId } = await request.json()

    if (!airtableApiKey || !airtableBaseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Both API key and Base ID are required",
        },
        { status: 400 },
      )
    }

    // Test the connection by fetching base metadata
    try {
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${airtableBaseId}/tables`, {
        headers: {
          Authorization: `Bearer ${airtableApiKey}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          return NextResponse.json({
            success: false,
            message: "Invalid API key. Please check your Airtable API key.",
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

      return NextResponse.json({
        success: true,
        message: "Connection successful!",
        baseInfo: {
          name: data.tables?.[0]?.name || "Unknown",
          tables,
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
