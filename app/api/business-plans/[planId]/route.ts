import { NextRequest, NextResponse } from "next/server"
import { deleteBusinessPlan, getBusinessPlan } from "@/lib/airtable"
import { userSettingsStore } from "@/lib/shared-store"

// Added GET endpoint to fetch individual plans
export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const { planId } = params

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      )
    }

    // Try to get user credentials from the shared store
    const demoEmail = "user@example.com"
    const userSettings = userSettingsStore.get(demoEmail)
    
    let plan = null

    // First try Airtable if credentials are available
    if (userSettings?.airtablePersonalAccessToken && userSettings?.airtableBaseId) {
      try {
        const credentials = {
          baseId: userSettings.airtableBaseId,
          token: userSettings.airtablePersonalAccessToken
        }
        
        const response = await fetch(`https://api.airtable.com/v0/${credentials.baseId}/Business%20Plans?filterByFormula={Plan ID}='${planId}'`, {
          headers: {
            'Authorization': `Bearer ${credentials.token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.records && data.records.length > 0) {
            const record = data.records[0]
            plan = {
              id: record.fields['Plan ID'],
              planName: record.fields['Plan Name'],
              ownerEmail: record.fields['Owner'],
              status: record.fields['Status'] || 'Draft',
              createdDate: record.fields['Created Date'],
              lastModified: record.fields['Last Modified'],
              description: `Business plan for ${record.fields['Plan Name']}`
            }
          }
        }
      } catch (airtableError) {
        console.warn("Airtable fetch failed, trying local storage:", airtableError)
      }
    }

    // If not found in Airtable, try local storage simulation
    if (!plan) {
      // Since we can't access localStorage on server, we'll check if this looks like a local plan
      if (planId.startsWith('local-')) {
        // Create a mock plan for local IDs to prevent 404s
        // In a real app, you'd want to store this data in a database
        plan = {
          id: planId,
          planName: "Local Business Plan",
          ownerEmail: demoEmail,
          status: "Draft",
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          description: "This is a locally created business plan"
        }
      }
    }

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      plan: plan
    })

  } catch (error) {
    console.error("Error in GET /api/business-plans/[planId]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const { planId } = params

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      )
    }

    // Delete the business plan
    const result = await deleteBusinessPlan(planId)

    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Failed to delete plan",
          details: result.error,
          airtableWorked: result.airtableWorked,
          troubleshooting: result.troubleshooting
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Plan deleted successfully",
      airtableWorked: result.airtableWorked
    })

  } catch (error) {
    console.error("Error in DELETE /api/business-plans/[planId]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
