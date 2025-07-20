import { type NextRequest, NextResponse } from "next/server"
import { updateBusinessPlanSectionWithUserCreds } from "@/lib/airtable-user"

export async function POST(request: NextRequest, { params }: { params: { planId: string; sectionName: string } }) {
  try {
    const body = await request.json()
    const { userEmail } = body

    await updateBusinessPlanSectionWithUserCreds(
      {
        planId: params.planId,
        sectionName: params.sectionName,
        sectionContent: "", // Will be preserved if record exists
        isComplete: true,
        submittedForReview: true,
        completedDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        modifiedBy: userEmail,
      },
      userEmail,
    )

    return NextResponse.json({
      success: true,
      message: "Section marked as complete and submitted for review!",
    })
  } catch (error) {
    console.error("Failed to mark section as complete:", error)
    return NextResponse.json({
      success: false,
      message: "Section marked as complete locally. Check your Airtable connection in Settings.",
    })
  }
}
