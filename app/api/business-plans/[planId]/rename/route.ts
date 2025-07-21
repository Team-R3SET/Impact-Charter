import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: { planId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { newName } = await request.json()

  if (!newName) {
    return NextResponse.json({ error: "New name is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("business_plans")
    .update({ plan_name: newName, updated_at: new Date().toISOString() })
    .match({ id: params.planId, owner_id: user.id })
    .select()
    .single()

  if (error) {
    console.error("Error renaming plan:", error)
    return NextResponse.json({ error: "Failed to rename plan" }, { status: 500 })
  }

  return NextResponse.json(data, { status: 200 })
}
