import type { NextRequest } from "next/server"
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  validateRequired,
  validateEmail,
} from "@/lib/api-utils"
import { getUserProfile } from "@/lib/supabase/queries"
import { logInfo } from "@/lib/logging"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return createErrorResponse("User ID is required", 400, "MISSING_USER_ID")
    }

    const profile = await getUserProfile(userId)

    if (!profile) {
      return createErrorResponse("User profile not found", 404, "PROFILE_NOT_FOUND")
    }

    logInfo("User profile retrieved", { userId })
    return createSuccessResponse(profile)
  } catch (error) {
    return handleApiError(error, "Get user profile")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, email, bio, company, role } = body

    // Validate required fields
    const requiredValidation =
      validateRequired(userId, "userId") || validateRequired(name, "name") || validateRequired(email, "email")

    if (requiredValidation) {
      return createErrorResponse(requiredValidation.message, 400, "VALIDATION_ERROR")
    }

    // Validate email format
    const emailValidation = validateEmail(email)
    if (emailValidation) {
      return createErrorResponse(emailValidation.message, 400, "INVALID_EMAIL")
    }

    // In a real app, you would update the profile in your database
    // For now, we'll simulate success
    const updatedProfile = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      bio: bio?.trim() || "",
      company: company?.trim() || "",
      role: role || "user",
      updatedAt: new Date().toISOString(),
    }

    logInfo("User profile updated", { userId, email })
    return createSuccessResponse(updatedProfile, "Profile updated successfully")
  } catch (error) {
    return handleApiError(error, "Update user profile")
  }
}
