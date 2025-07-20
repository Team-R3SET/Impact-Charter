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

// Add a GET method for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}
