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
    // For now, we'll use a demo email since we don't have user context
    const demoEmail = "user@example.com"
    const userSettings = userSettingsStore.get(demoEmail)
    let credentials: { baseId: string; token: string } | undefined

    if (userSettings?.airtablePersonalAccessToken && userSettings?.airtableBaseId) {
      credentials = {
        baseId: userSettings.airtableBaseId,
        token: userSettings.airtablePersonalAccessToken
      }
    }

    // Get the business plan
    const plan = await getBusinessPlan(planId, credentials)

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
