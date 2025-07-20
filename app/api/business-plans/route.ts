import { type NextRequest, NextResponse } from "next/server"
import { createBusinessPlan, getBusinessPlans } from "@/lib/airtable"
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

    // Ensure we never return a plan without an id
    const planWithId = plan.id ? plan : { ...plan, id: randomUUID() }

    return NextResponse.json({ plan: planWithId }, { status: 201 })
  } catch (error) {
    console.error("Failed to create business plan:", error)
    return NextResponse.json(
      {
        error: "Failed to create business plan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get("owner")

    if (!owner) {
      return NextResponse.json({ error: "Owner email is required" }, { status: 400 })
    }

    const plans = await getBusinessPlans(owner)
    return NextResponse.json({ plans })
  } catch (error) {
    console.error("Failed to fetch business plans:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch business plans",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
