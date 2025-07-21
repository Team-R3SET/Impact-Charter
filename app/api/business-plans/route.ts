import type { NextRequest } from "next/server"
import { getBusinessPlans, createBusinessPlan } from "@/lib/airtable"
import { getUserSettings } from "@/lib/user-settings"
import { handleApiError, createApiResponse, createApiError, validateRequired } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")

    if (!userEmail) {
      return createApiError("User email is required", 400, "MISSING_PARAM")
    }

    const settings = await getUserSettings(userEmail)
    const plans = await getBusinessPlans(userEmail, settings)
    return createApiResponse(plans)
  } catch (error) {
    return handleApiError(error, "Failed to retrieve business plans")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const missingFields = validateRequired(body, ["planName", "ownerEmail"])

    if (missingFields.length > 0) {
      return createApiError(`Missing required fields: ${missingFields.join(", ")}`, 400, "VALIDATION_ERROR")
    }

    const { planName, description, ownerEmail } = body
    const settings = await getUserSettings(ownerEmail)
    const newPlan = await createBusinessPlan({ planName, description, ownerEmail }, settings)

    return createApiResponse({ plan: newPlan }, 201)
  } catch (error) {
    return handleApiError(error, "Failed to create business plan")
  }
}
