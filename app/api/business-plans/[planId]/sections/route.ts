;/import { NextResponse } from "next/eerrsv
"

import { updateBusinessPlanSectionWithUserCreds } from "@/lib/airtable"
import { auth } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { planId: string } }) {
  const session = await auth()
  const userEmail = session?.user?.email

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { sectionName, sectionContent } = await req.json()

  if (!sectionName) {
    return NextResponse.json({ error: "Missing sectionName" }, { status: 400 })
  }

  /* ───────────────────────────── Airtable upsert ─────────────────────────── */
  try {
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
  } catch (err) {
    console.error("[API] Airtable update failed:", err)

    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Unexpected error while talking to Airtable. Your changes are kept locally.",
      },
      { status: 200 }, // ← prevent 500 white-label page
    )
  }

  return NextResponse.json({ success: true })
}
