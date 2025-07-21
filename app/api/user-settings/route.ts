import type { NextRequest } from "next/server"
import { createSuccessResponse, createErrorResponse, handleApiError, validateRequired } from "@/lib/api-utils"
import { logInfo } from "@/lib/logging"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return createErrorResponse("User ID is required", 400, "MISSING_USER_ID")
    }

    // In a real app, fetch from database
    const settings = {
      userId,
      theme: "system",
      notifications: {
        email: true,
        push: false,
        comments: true,
        mentions: true,
      },
      privacy: {
        profileVisible: true,
        showEmail: false,
      },
      integrations: {
        airtable: {
          connected: !!process.env.AIRTABLE_API_KEY,
          apiKey: process.env.AIRTABLE_API_KEY ? "***" : "",
          baseId: process.env.AIRTABLE_BASE_ID ? "***" : "",
        },
        liveblocks: {
          connected: !!process.env.LIVEBLOCKS_SECRET_KEY,
        },
      },
    }

    logInfo("User settings retrieved", { userId })
    return createSuccessResponse(settings)
  } catch (error) {
    return handleApiError(error, "Get user settings")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, settings } = body

    const requiredValidation = validateRequired(userId, "userId")
    if (requiredValidation) {
      return createErrorResponse(requiredValidation.message, 400, "VALIDATION_ERROR")
    }

    if (!settings || typeof settings !== "object") {
      return createErrorResponse("Settings object is required", 400, "INVALID_SETTINGS")
    }

    // Validate settings structure
    const validThemes = ["light", "dark", "system"]
    if (settings.theme && !validThemes.includes(settings.theme)) {
      return createErrorResponse("Invalid theme value", 400, "INVALID_THEME")
    }

    // In a real app, save to database
    const updatedSettings = {
      ...settings,
      userId,
      updatedAt: new Date().toISOString(),
    }

    logInfo("User settings updated", { userId, theme: settings.theme })
    return createSuccessResponse(updatedSettings, "Settings updated successfully")
  } catch (error) {
    return handleApiError(error, "Update user settings")
  }
}
