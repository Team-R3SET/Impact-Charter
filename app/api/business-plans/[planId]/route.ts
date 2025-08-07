import { NextRequest, NextResponse } from "next/server"
import { deleteBusinessPlan, getBusinessPlan } from "@/lib/airtable"
import { userSettingsStore } from "@/lib/shared-store"
import { LocalStorageManager } from "@/lib/local-storage"

// Enhanced GET endpoint to properly retrieve actual plan names from local storage
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
            console.log(`[API] Plan found in Airtable: ${plan.planName}`)
            return NextResponse.json({
              success: true,
              plan: plan,
              source: "airtable"
            })
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

    // Try to get the plan from local storage first before creating fallback
    try {
      const localPlan = LocalStorageManager.getBusinessPlan(planId)
      if (localPlan) {
        console.log(`[API] Plan found in local storage: ${localPlan.planName}`)
        return NextResponse.json({
          success: true,
          plan: localPlan,
          source: "local-storage"
        })
      }
    } catch (localError) {
      console.warn("[API] Failed to get plan from local storage:", localError)
    }

    // Enhanced fallback handling that tries to preserve plan names
    console.log(`[API] Plan not found, creating fallback plan for: ${planId}`)
    
    // For local IDs, try to extract timestamp for better date handling
    let createdDate = new Date().toISOString()
    let planName = "Impact Charter"
    
    if (planId.startsWith('local-')) {
      const localParts = planId.split('-')
      const timestamp = localParts.length > 1 ? parseInt(localParts[1]) : 0
      if (timestamp && !isNaN(timestamp)) {
        createdDate = new Date(timestamp).toISOString()
      }
      
      // Try to get all plans and find this one by ID to get the actual name
      try {
        const allPlans = LocalStorageManager.getAllBusinessPlans()
        const existingPlan = allPlans.find(p => p.id === planId)
        if (existingPlan && existingPlan.planName) {
          planName = existingPlan.planName
          console.log(`[API] Found existing plan name in storage: ${planName}`)
        }
      } catch (error) {
        console.warn("[API] Could not retrieve existing plan name:", error)
      }
    }
    
    plan = {
      id: planId,
      planName: planName,
      ownerEmail: "user@example.com",
      status: "Draft",
      createdDate: createdDate,
      lastModified: new Date().toISOString(),
      description: `Business plan for ${planName}`
    }
    
    return NextResponse.json({
      success: true,
      plan: plan,
      source: "fallback",
      warning: "Plan not found in Airtable or local storage, using fallback data"
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
