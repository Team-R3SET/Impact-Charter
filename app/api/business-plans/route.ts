import { type NextRequest, NextResponse } from "next/server"
import { createBusinessPlan } from "@/lib/airtable"
import { randomUUID } from "crypto"

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

    // 🔑 Fallback for local/dev where Airtable may not return an id
    const planId = plan.id ?? randomUUID()

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error("Failed to create business plan:", error)
    return NextResponse.json({ error: "Failed to create business plan" }, { status: 500 })
  }
}
