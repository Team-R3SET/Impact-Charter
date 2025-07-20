import { type NextRequest, NextResponse } from "next/server"
import { updateBusinessPlanSectionWithUserCreds } from "@/lib/airtable-user"

export async function POST(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    const body = await request.json()
    const { sectionName, sectionContent, modifiedBy } = body

    // Use user-specific credentials instead of global ones
    await updateBusinessPlanSectionWithUserCreds(
      {
        planId: params.planId,
        sectionName,
        sectionContent,
        lastModified: new Date().toISOString(),
        modifiedBy,
      },
      modifiedBy,
    ) // modifiedBy is the user email

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update section:", error)
    // Don't return 500 - the app should continue working even if Airtable fails
    return NextResponse.json({
      success: false,
      message: "Section saved locally. Check your Airtable connection in Settings.",
    })
  }
}
