import { type NextRequest, NextResponse } from "next/server"
import { updateBusinessPlanSectionWithUserCreds } from "@/lib/airtable-user"

export async function POST(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    console.log(`[API] Updating section for planId: ${params.planId}`)

    // Ensure we can parse the request body
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

    const { sectionName, sectionContent, userEmail } = body

    // Validate required fields
    if (!sectionName || !userEmail) {
      console.error("[API] Missing required fields:", { sectionName, userEmail })
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: sectionName and userEmail are required",
        },
        { status: 400 },
      )
    }

    // Validate planId parameter
    if (!params.planId) {
      console.error("[API] Missing planId parameter")
      return NextResponse.json(
        {
          success: false,
          error: "Missing planId parameter",
        },
        { status: 400 },
      )
    }

    console.log(`[API] Processing section update:`, {
      planId: params.planId,
      sectionName,
      userEmail,
      contentLength: sectionContent?.length || 0,
    })

    // Use user-specific credentials instead of global ones
    await updateBusinessPlanSectionWithUserCreds(
      {
        planId: params.planId,
        sectionName,
        sectionContent: sectionContent || "",
        lastModified: new Date().toISOString(),
        modifiedBy: userEmail,
      },
      userEmail,
    )

    console.log(`[API] Successfully updated section: ${sectionName}`)
    return NextResponse.json({
      success: true,
      message: "Section updated successfully",
    })
  } catch (error) {
    console.error("[API] Failed to update section:", error)

    // Ensure we always return JSON, even for unexpected errors
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

export async function GET(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    console.log(`[API] Getting sections for planId: ${params.planId}`)

    // Validate planId parameter
    if (!params.planId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing planId parameter",
        },
        { status: 400 },
      )
    }

    // For now, return empty sections - this can be expanded later
    return NextResponse.json({
      success: true,
      sections: [],
    })
  } catch (error) {
    console.error("[API] Failed to get sections:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
