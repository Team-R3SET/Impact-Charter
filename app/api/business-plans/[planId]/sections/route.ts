import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getPlanSections, updateBusinessPlanSection } from "@/lib/supabase/queries"

export async function GET(request: Request, { params }: { params: { planId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const sections = await getPlanSections(params.planId)
    return NextResponse.json(sections)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { planId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sectionData = await request.json()

  try {
    const updatedSection = await updateBusinessPlanSection({
      ...sectionData,
      plan_id: params.planId,
      modified_by_email: user.email,
    })
    return NextResponse.json(updatedSection)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
  }
}
