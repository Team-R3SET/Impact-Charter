import { type NextRequest, NextResponse } from "next/server"
import { getBusinessPlans } from "@/lib/airtable"
import { getUserSettings } from "@/lib/user-settings"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerEmail = searchParams.get("owner")

    if (!ownerEmail) {
      return NextResponse.json({ error: "Owner email is required" }, { status: 400 })
    }

    const settings = await getUserSettings(ownerEmail)
    const plans = await getBusinessPlans(ownerEmail, settings)

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("Failed to get business plans:", error)
    return NextResponse.json({ error: "Failed to retrieve business plans" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planName, ownerEmail } = body

    if (!planName || !ownerEmail) {
      return NextResponse.json({ error: "Plan name and owner email are required" }, { status: 400 })
    }

    const settings = await getUserSettings(ownerEmail)
    // Note: createBusinessPlan would also need to be refactored to accept settings
    // For now, this part might still use env vars or fail gracefully.
    // const newPlan = await createBusinessPlan({ ... }, settings);

    // Mocking response for now as createBusinessPlan is not fully refactored in this example
    const newPlan = {
      id: "new-plan-id",
      planName,
      ownerEmail,
      status: "Draft",
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }

    return NextResponse.json({ plan: newPlan }, { status: 201 })
  } catch (error) {
    console.error("Failed to create business plan:", error)
    return NextResponse.json({ error: "Failed to create business plan" }, { status: 500 })
  }
}
