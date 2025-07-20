import { type NextRequest, NextResponse } from "next/server"
import { updateBusinessPlanSectionWithUserCreds } from "@/lib/airtable-user"

export async function POST(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    console.log(`[API] Updating section for planId: ${params.planId}`)

    const body = await request.json()
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

    // Return proper JSON error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error occurred while saving section",
        details: "Check your Airtable connection in Settings or continue working in local mode.",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    console.log(`[API] Getting sections for planId: ${params.planId}`)

    // For now, return empty sections - this can be expanded later
    return NextResponse.json({
      success: true,
      sections: [],
    })
  } catch (error) {
    console.error("[API] Failed to get sections:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve sections",
      },
      { status: 500 },
    )
  }
}
