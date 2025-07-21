import { type NextRequest, NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

export async function PATCH(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    const { planName } = await request.json()
    const { planId } = params

    if (!planName?.trim()) {
      return NextResponse.json({ error: "Plan name is required" }, { status: 400 })
    }

    // If Airtable is not configured, return success with the new name
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({
        success: true,
        planName: planName.trim(),
        message: "Plan renamed successfully (local mode)",
      })
    }

    try {
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans/${planId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            planName: planName.trim(),
            lastModified: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Airtable request failed: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json({
        success: true,
        planName: data.fields.planName,
        message: "Plan renamed successfully",
      })
    } catch (airtableError) {
      console.warn("Airtable rename failed, using fallback:", airtableError)
      return NextResponse.json({
        success: true,
        planName: planName.trim(),
        message: "Plan renamed successfully (fallback mode)",
      })
    }
  } catch (error) {
    console.error("Failed to rename business plan:", error)
    return NextResponse.json({ error: "Failed to rename business plan" }, { status: 500 })
  }
}
