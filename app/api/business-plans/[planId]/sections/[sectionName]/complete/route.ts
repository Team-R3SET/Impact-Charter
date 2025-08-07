import { NextResponse } from "next/server"
import { markBusinessPlanSectionComplete } from "@/lib/airtable-user"

/**
 * Mark a section as "complete".
 *
 *   POST /api/business-plans/:planId/sections/:sectionName/complete
 *   Body: { userEmail: string }
 */
export async function POST(request: Request, { params }: { params: { planId: string; sectionName: string } }) {
  let body: { userEmail?: string } = {}

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: "Body must be valid JSON." }, { status: 200 })
  }

  const { userEmail } = body
  if (!userEmail) {
    return NextResponse.json({ success: false, error: "Missing userEmail." }, { status: 200 })
  }

  try {
    await markBusinessPlanSectionComplete(
      {
        planId: params.planId,
        sectionName: params.sectionName,
        completedBy: userEmail,
        completedAt: new Date().toISOString(),
      },
      userEmail,
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[API] Complete-section failed:", err)

    const errorMessage = err instanceof Error ? err.message : "Unknown Airtable error."
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Determine error type and provide specific guidance
    let errorType = "UNKNOWN"
    let troubleshootingSteps = []
    
    if (errorMessage.includes("404") || errorMessage.includes("table not found")) {
      errorType = "TABLE_NOT_FOUND"
      troubleshootingSteps = [
        "Check if the 'Business Plan Sections' table exists in your Airtable base",
        "Verify your Airtable Base ID is correct in environment variables",
        "Ensure your API key has access to the specified base"
      ]
    } else if (errorMessage.includes("401") || errorMessage.includes("API key")) {
      errorType = "AUTH_ERROR"
      troubleshootingSteps = [
        "Verify your Airtable API key is correct",
        "Check if your API key has expired",
        "Ensure the API key has proper permissions"
      ]
    } else if (errorMessage.includes("403") || errorMessage.includes("Permission denied")) {
      errorType = "PERMISSION_ERROR"
      troubleshootingSteps = [
        "Check if your API key has write permissions to the base",
        "Verify you have access to the 'Business Plan Sections' table",
        "Contact your Airtable workspace admin for permissions"
      ]
    } else {
      troubleshootingSteps = [
        "Check your internet connection",
        "Verify Airtable service status",
        "Try again in a few minutes"
      ]
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorDetails: {
          errorId,
          errorType,
          troubleshootingSteps,
          timestamp: new Date().toISOString(),
          context: {
            planId: params.planId,
            sectionName: params.sectionName,
            userEmail
          }
        }
      },
      { status: 200 },
    )
  }
}
