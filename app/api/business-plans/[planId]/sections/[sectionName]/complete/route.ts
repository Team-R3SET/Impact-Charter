import { type NextRequest, NextResponse } from "next/server"
import { markSectionAsCompleteWithUserCreds } from "@/lib/airtable-user"

export async function POST(request: NextRequest, { params }: { params: { planId: string; sectionName: string } }) {
  try {
    console.log(`[API] Marking section complete: ${params.sectionName} for plan: ${params.planId}`)

    const body = await request.json()
    const { userEmail } = body

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: userEmail",
        },
        { status: 400 },
      )
    }

    // Mark section as complete using user credentials
    await markSectionAsCompleteWithUserCreds(params.planId, params.sectionName, userEmail)

    console.log(`[API] Successfully marked section complete: ${params.sectionName}`)
    return NextResponse.json({
      success: true,
      message: "Section marked as complete successfully",
    })
  } catch (error) {
    console.error("[API] Failed to mark section complete:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to mark section as complete",
      },
      { status: 500 },
    )
  }
}
