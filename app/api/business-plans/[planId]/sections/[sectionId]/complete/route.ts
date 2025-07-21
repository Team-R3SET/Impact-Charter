import type { NextRequest } from "next/server"
import { createApiResponse, createErrorResponse } from "@/lib/api-utils"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { planId: string; sectionId: string } }) {
  try {
    const supabase = createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse("Unauthorized", 401)
    }

    const { planId, sectionId } = params

    // Verify user has access to this plan
    const { data: plan, error: planError } = await supabase
      .from("business_plans")
      .select("id, owner_id")
      .eq("id", planId)
      .single()

    if (planError || !plan) {
      return createErrorResponse("Plan not found", 404)
    }

    if (plan.owner_id !== user.id) {
      return createErrorResponse("Access denied", 403)
    }

    // Mark section as complete
    const { error: updateError } = await supabase
      .from("plan_sections")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("plan_id", planId)
      .eq("section_id", sectionId)

    if (updateError) {
      console.error("Error marking section complete:", updateError)
      return createErrorResponse("Failed to mark section as complete", 500)
    }

    return createApiResponse({
      success: true,
      message: "Section marked as complete",
    })
  } catch (error) {
    console.error("Error in complete section endpoint:", error)
    return createErrorResponse("Internal server error", 500)
  }
}
