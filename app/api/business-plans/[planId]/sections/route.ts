import { NextResponse } from "next/server"
import { updateBusinessPlanSectionWithUserCreds } from "@/lib/airtable-user"

/**
 * Upsert (create or update) a single section for a business-plan.
 *
 *   POST /api/business-plans/:planId/sections
 *   Body: { sectionName: string, sectionContent: string, userEmail: string }
 *
 * The route ALWAYS returns JSON:
 *   • { success:true }                        – on success
 *   • { success:false, error:"…" }            – on any failure
 * Never sends an HTML 500 page, eliminating “Internal server error” in the client.
 */
export async function POST(request: Request, { params }: { params: { planId: string } }) {
  let body: {
    sectionName?: string
    sectionContent?: string
    userEmail?: string
  } = {}

  /* ------------------------------------------------------------------ */
  /* 1️⃣  Parse and validate input                                       */
  /* ------------------------------------------------------------------ */
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: "Body must be valid JSON." }, { status: 200 })
  }

  const { sectionName, sectionContent = "", userEmail } = body

  if (!sectionName || !userEmail) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required fields: sectionName and userEmail.",
      },
      { status: 200 },
    )
  }

  /* ------------------------------------------------------------------ */
  /* 2️⃣  Write to Airtable                                              */
  /* ------------------------------------------------------------------ */
  try {
    await updateBusinessPlanSectionWithUserCreds(
      {
        planId: params.planId,
        sectionName,
        sectionContent,
        lastModified: new Date().toISOString(),
        modifiedBy: userEmail,
      },
      userEmail,
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[API] Airtable update failed:", err)

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown Airtable error.",
      },
      { status: 200 },
    )
  }
}
