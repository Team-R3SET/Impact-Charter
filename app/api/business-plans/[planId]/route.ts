import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: Request, { params }: { params: { planId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase.from("business_plans").delete().match({ id: params.planId, owner_id: user.id })

  if (error) {
    console.error("Error deleting plan:", error)
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 })
  }

  return NextResponse.json({ message: "Plan deleted successfully" }, { status: 200 })
}
