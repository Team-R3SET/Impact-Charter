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
    console.log(`[API] GET /api/business-plans/${planId} called`)

    if (!planId) {
      console.log(`[API] Missing planId parameter`)
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      )
    }

    // Enhanced fallback handling for all plan types
    // Always create a fallback plan for local IDs
    if (planId.startsWith('local-')) {
      console.log(`[API] Creating fallback plan for local ID: ${planId}`)
      const plan = {
        id: planId,
        planName: "Local Business Plan",
        ownerEmail: "user@example.com",
        status: "Draft",
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        description: "This is a locally created business plan"
      }
      
      return NextResponse.json({
        success: true,
        plan: plan,
        source: "local-fallback"
      })
    }

    // Try to get user credentials from the shared store
    const demoEmail = "user@example.com"
    const userSettings = userSettingsStore.get(demoEmail)
    console.log(`[API] User settings found: ${!!userSettings}`)
    
    let plan = null

    // First try Airtable if credentials are available
    if (userSettings?.airtablePersonalAccessToken && userSettings?.airtableBaseId) {
      try {
        console.log(`[API] Attempting to fetch from Airtable`)
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

        console.log(`[API] Airtable response status: ${response.status}`)
        
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
            console.log(`[API] Plan found in Airtable`)
          } else {
            console.log(`[API] No matching records found in Airtable`)
          }
        } else {
          const errorText = await response.text()
          console.error(`[API] Airtable error: ${response.status} - ${errorText}`)
        }
      } catch (airtableError) {
        console.warn("[API] Airtable fetch failed:", airtableError)
      }
    }

    // Create fallback plan for any UUID that wasn't found in Airtable
    if (!plan) {
      console.log(`[API] Plan not found in Airtable, creating fallback plan for UUID: ${planId}`)
      plan = {
        id: planId,
        planName: "Business Plan",
        ownerEmail: "user@example.com",
        status: "Draft",
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        description: "This business plan was created locally and needs to be synced to Airtable"
      }
      
      return NextResponse.json({
        success: true,
        plan: plan,
        source: "uuid-fallback",
        warning: "Plan not found in Airtable, using fallback data"
      })
    }

    console.log(`[API] Returning plan successfully`)
    return NextResponse.json({
      success: true,
      plan: plan,
      source: "airtable"
    })

  } catch (error) {
    console.error("[API] Error in GET /api/business-plans/[planId]:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
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
