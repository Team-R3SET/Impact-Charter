import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: plans, error } = await supabase
    .from("business_plans")
    .select("*")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
  }

  return NextResponse.json({ plans })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { planName } = await request.json()

  if (!planName) {
    return NextResponse.json({ error: "Plan name is required" }, { status: 400 })
  }

  const { data: newPlan, error } = await supabase
    .from("business_plans")
    .insert({ plan_name: planName, owner_id: user.id })
    .select()
    .single()

  if (error) {
    console.error("Error creating plan:", error)
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 })
  }

  return NextResponse.json(newPlan, { status: 201 })
}
