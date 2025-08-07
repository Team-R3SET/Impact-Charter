import { NextRequest, NextResponse } from "next/server"
import { deleteBusinessPlan } from "@/lib/airtable"

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
