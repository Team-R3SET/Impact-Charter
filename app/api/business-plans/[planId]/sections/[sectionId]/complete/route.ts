import { NextResponse } from "next/server"
import { markBusinessPlanSectionComplete } from "@/lib/airtable-user"

/**
 * Mark a section as “complete”.
 *
 *   POST /api/business-plans/:planId/sections/:sectionId/complete
 *   Body: { userEmail: string }
 */
export async function POST(request: Request, { params }: { params: { planId: string; sectionId: string } }) {
  let body: { userEmail?: string } = {}

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: "Body must be valid JSON." }, { status: 200 })
  }

  const { userEmail } = body
  if (!userEmail) {
    return NextResponse.json({ success: false, error: "Missing userEmail." }, { status: 200 })
  }

  try {
    await markBusinessPlanSectionComplete(
      {
        planId: params.planId,
        sectionId: params.sectionId,
        completedBy: userEmail,
        completedAt: new Date().toISOString(),
      },
      userEmail,
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[API] Complete-section failed:", err)

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown Airtable error.",
      },
      { status: 200 },
    )
  }
}
