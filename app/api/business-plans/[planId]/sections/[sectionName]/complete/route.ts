import { type NextRequest, NextResponse } from "next/server"
import { markSectionAsCompleteWithUserCreds } from "@/lib/airtable-user"

export async function POST(request: NextRequest, { params }: { params: { planId: string; sectionName: string } }) {
  try {
    console.log(`[API] Marking section complete: ${params.sectionName} for plan: ${params.planId}`)

    // Validate parameters
    if (!params.planId || !params.sectionName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: planId and sectionName are required",
        },
        { status: 400 },
      )
    }

    // Parse request body safely
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[API] Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 },
      )
    }

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

    console.log(`[API] Processing completion for:`, {
      planId: params.planId,
      sectionName: params.sectionName,
      userEmail,
    })

    // Mark section as complete using user credentials
    await markSectionAsCompleteWithUserCreds(params.planId, params.sectionName, userEmail)

    console.log(`[API] Successfully marked section complete: ${params.sectionName}`)
    return NextResponse.json({
      success: true,
      message: "Section marked as complete successfully",
    })
  } catch (error) {
    console.error("[API] Failed to mark section complete:", error)

    // Ensure we always return JSON
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: "Check your Airtable connection in Settings or continue working in local mode.",
      },
      { status: 500 },
    )
  }
}
