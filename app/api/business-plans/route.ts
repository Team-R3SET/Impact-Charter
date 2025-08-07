import { type NextRequest, NextResponse } from "next/server"
import { getBusinessPlans, createBusinessPlan } from "@/lib/airtable"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerEmail = searchParams.get("owner")
    const limit = searchParams.get("limit")

    if (!ownerEmail) {
      return NextResponse.json({ error: "Owner email is required" }, { status: 400 })
    }

    console.log(`[API] Fetching business plans for: ${ownerEmail}`)

    const result = await getBusinessPlans(ownerEmail)
    let plans = result.plans || []

    // Apply limit if specified
    if (limit) {
      const limitNum = Number.parseInt(limit, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        plans = plans.slice(0, limitNum)
      }
    }

    console.log(`[API] Returning ${plans.length} plans`)
    return NextResponse.json({
      plans,
      airtableWorked: result.airtableWorked,
      error: result.error,
      troubleshooting: result.troubleshooting
    })
  } catch (error) {
    console.error("[API] Error fetching business plans:", error)
    return NextResponse.json({ error: "Failed to fetch business plans" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planName, ownerEmail, status = "Draft" } = body

    if (!planName || !ownerEmail) {
      return NextResponse.json({ error: "Plan name and owner email are required" }, { status: 400 })
    }

    console.log(`[API] Creating business plan: ${planName} for ${ownerEmail}`)

    // Updated to handle Airtable error reporting
    const result = await createBusinessPlan({
      planName,
      ownerEmail,
      status,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    })

    console.log(`[API] Created plan with ID: ${result.plan.id}`)
    
    // Return plan data along with Airtable status
    return NextResponse.json({
      ...result.plan,
      _airtableWorked: result.airtableWorked,
      _airtableError: result.error
    }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating business plan:", error)
    return NextResponse.json({ error: "Failed to create business plan" }, { status: 500 })
  }
}
