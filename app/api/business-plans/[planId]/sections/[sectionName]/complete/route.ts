import { type NextRequest, NextResponse } from "next/server"
import { markSectionAsComplete } from "@/lib/airtable"

export async function POST(request: NextRequest, { params }: { params: { planId: string; sectionName: string } }) {
  try {
    const body = await request.json()
    const { userEmail } = body

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    await markSectionAsComplete(params.planId, params.sectionName, userEmail)

    return NextResponse.json({
      success: true,
      message: "Section marked as complete and submitted for review",
    })
  } catch (error) {
    console.error("Failed to mark section as complete:", error)

    // Provide specific error messages based on the error type
    let errorMessage = "Failed to mark section as complete"
    if (error instanceof Error) {
      if (error.message.includes("404")) {
        errorMessage = "Section not found in database"
      } else if (error.message.includes("401") || error.message.includes("403")) {
        errorMessage = "Authentication failed - please check your Airtable credentials"
      } else if (error.message.includes("422")) {
        errorMessage = "Invalid data format - please try again"
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network error - please check your connection"
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
