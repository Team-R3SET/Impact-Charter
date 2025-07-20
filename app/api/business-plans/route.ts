import { type NextRequest, NextResponse } from "next/server"
import { createBusinessPlan } from "@/lib/airtable"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planName, ownerEmail } = body

    if (!planName || !ownerEmail) {
      return NextResponse.json({ error: "Plan name and owner email are required" }, { status: 400 })
    }

    const plan = await createBusinessPlan({
      planName: planName.trim(),
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      ownerEmail,
      status: "Draft",
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Failed to create business plan:", error)
    return NextResponse.json({ error: "Failed to create business plan" }, { status: 500 })
  }
}
