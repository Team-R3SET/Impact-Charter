import { NextResponse } from "next/server"
import { updateBusinessPlanSectionWithUserCreds } from "@/lib/airtable-user"

/**
 * Save (or update) a single section for a business-plan.
 * Expects JSON: { sectionName, sectionContent, userEmail }
 */
export async function POST(request: Request, { params }: { params: { planId: string } }) {
  try {
    /* -------------------------------------------------------------------- */
    /* 1️⃣  Validate request body                                            */
    /* -------------------------------------------------------------------- */
    const { sectionName, sectionContent = "", userEmail } = await request.json()

    if (!sectionName || !userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: sectionName and userEmail",
        },
        { status: 400 },
      )
    }

    /* -------------------------------------------------------------------- */
    /* 2️⃣  Upsert into Airtable                                             */
    /* -------------------------------------------------------------------- */
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

    /* -------------------------------------------------------------------- */
    /* 3️⃣  Success                                                          */
    /* -------------------------------------------------------------------- */
    return NextResponse.json({ success: true })
  } catch (err) {
    /* -------------------------------------------------------------------- */
    /* 4️⃣  Airtable (or other) failure – return *graceful* JSON             */
    /* -------------------------------------------------------------------- */
    console.error("[API] Failed to update section:", err)

    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Unexpected error while talking to Airtable. Your changes are kept locally.",
      },
      { status: 200 }, // ➜ keeps the client from seeing a 500 HTML page
    )
  }
}
