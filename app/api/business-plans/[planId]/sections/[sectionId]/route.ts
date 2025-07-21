import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createErrorResponse, createSuccessResponse } from "@/lib/api-utils"
import { configManager } from "@/lib/config"
import { z } from "zod"

const sectionUpdateSchema = z.object({
  content: z.string().min(1, "Content is required"),
  title: z.string().optional(),
  completed: z.boolean().optional(),
  lastModified: z.string().datetime().optional(),
})

export async function GET(request: NextRequest, { params }: { params: { planId: string; sectionId: string } }) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return createErrorResponse("UNAUTHORIZED", "Authentication required", 401)
    }

    const { planId, sectionId } = params

    // Check if user has access to this plan
    const { data: plan, error: planError } = await supabase
      .from("business_plans")
      .select("id, user_id, title")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single()

    if (planError || !plan) {
      return createErrorResponse("PLAN_NOT_FOUND", "Business plan not found", 404)
    }

    // Get section data from Airtable if configured, otherwise use fallback
    let sectionData
    if (configManager.isAirtableConfigured()) {
      const { getBusinessPlanSection } = await import("@/lib/airtable")
      sectionData = await getBusinessPlanSection(planId, sectionId)
    } else {
      // Fallback to local storage or mock data
      sectionData = {
        id: sectionId,
        planId,
        title: `Section ${sectionId}`,
        content: "",
        completed: false,
        lastModified: new Date().toISOString(),
      }
    }

    return createSuccessResponse(sectionData)
  } catch (error) {
    console.error("Error fetching section:", error)
    return createErrorResponse("SECTION_FETCH_ERROR", "Failed to fetch section", 500, {
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { planId: string; sectionId: string } }) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return createErrorResponse("UNAUTHORIZED", "Authentication required", 401)
    }

    const { planId, sectionId } = params
    const body = await request.json()

    // Validate request body
    const validationResult = sectionUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return createErrorResponse("VALIDATION_ERROR", "Invalid request data", 400, {
        errors: validationResult.error.errors,
      })
    }

    const updateData = validationResult.data

    // Check if user has access to this plan
    const { data: plan, error: planError } = await supabase
      .from("business_plans")
      .select("id, user_id, title")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single()

    if (planError || !plan) {
      return createErrorResponse("PLAN_NOT_FOUND", "Business plan not found", 404)
    }

    // Update section in Airtable if configured
    let updatedSection
    if (configManager.isAirtableConfigured()) {
      const { updateBusinessPlanSection } = await import("@/lib/airtable")
      updatedSection = await updateBusinessPlanSection(planId, sectionId, updateData)
    } else {
      // Fallback: simulate update
      updatedSection = {
        id: sectionId,
        planId,
        ...updateData,
        lastModified: new Date().toISOString(),
      }
    }

    // Update last modified timestamp for the plan
    await supabase.from("business_plans").update({ updated_at: new Date().toISOString() }).eq("id", planId)

    return createSuccessResponse(updatedSection)
  } catch (error) {
    console.error("Error updating section:", error)
    return createErrorResponse("SECTION_UPDATE_ERROR", "Failed to update section", 500, {
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { planId: string; sectionId: string } }) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return createErrorResponse("UNAUTHORIZED", "Authentication required", 401)
    }

    const { planId, sectionId } = params

    // Check if user has access to this plan
    const { data: plan, error: planError } = await supabase
      .from("business_plans")
      .select("id, user_id, title")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single()

    if (planError || !plan) {
      return createErrorResponse("PLAN_NOT_FOUND", "Business plan not found", 404)
    }

    // Delete section from Airtable if configured
    if (configManager.isAirtableConfigured()) {
      const { deleteBusinessPlanSection } = await import("@/lib/airtable")
      await deleteBusinessPlanSection(planId, sectionId)
    }

    return createSuccessResponse({ deleted: true, sectionId })
  } catch (error) {
    console.error("Error deleting section:", error)
    return createErrorResponse("SECTION_DELETE_ERROR", "Failed to delete section", 500, {
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
