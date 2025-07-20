import { type NextRequest, NextResponse } from "next/server"
import { updateBusinessPlanSection } from "@/lib/airtable"

export async function POST(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    const body = await request.json()
    const { sectionName, sectionContent, modifiedBy } = body

    await updateBusinessPlanSection({
      planId: params.planId,
      sectionName,
      sectionContent,
      lastModified: new Date().toISOString(),
      modifiedBy,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update section:", error)
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
  }
}
