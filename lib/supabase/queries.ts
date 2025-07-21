import { createClient } from "@/lib/supabase/server"
import type { BusinessPlan, BusinessPlanSection, UserProfile } from "@/lib/types"

export async function getBusinessPlans(ownerId: string): Promise<BusinessPlan[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("business_plans")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching business plans:", error)
    throw new Error("Failed to retrieve business plans.")
  }
  return data || []
}

export async function getBusinessPlan(planId: string): Promise<BusinessPlan | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("business_plans").select("*").eq("id", planId).single()

  if (error) {
    console.error(`Error fetching plan ${planId}:`, error)
    return null
  }
  return data
}

export async function getPlanSections(planId: string): Promise<BusinessPlanSection[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("business_plan_sections")
    .select("*")
    .eq("plan_id", planId)
    .order("updated_at", { ascending: true })

  if (error) {
    console.error("Error fetching plan sections:", error)
    return []
  }
  return data
}

export async function updateBusinessPlanSection(
  section: Partial<BusinessPlanSection> & { plan_id: string; section_name: string },
): Promise<BusinessPlanSection> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("business_plan_sections")
    .upsert(
      {
        ...section,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "plan_id,section_name" },
    )
    .select()
    .single()

  if (error) {
    console.error("Error updating section:", error)
    throw new Error("Failed to save section.")
  }
  return data
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error.message)
    return null
  }
  return data
}

export async function canUserAccessPlan(userId: string, planId: string): Promise<boolean> {
  const supabase = createClient()

  // This query checks if the user is the owner of the plan.
  // TODO: Extend this to check a `plan_collaborators` table if you add sharing functionality.
  const { data, error } = await supabase
    .from("business_plans")
    .select("id")
    .eq("id", planId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("Error checking plan access:", error)
    return false
  }

  // If data is not null, a record was found where the planId and userId match.
  return data !== null
}
