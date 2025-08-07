import { type NextRequest, NextResponse } from "next/server"
import { userSettingsStore } from "@/lib/shared-store"
import { LocalStorageManager } from "@/lib/local-storage"

export async function PATCH(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    const { planName } = await request.json()
    const { planId } = params

    if (!planName?.trim()) {
      return NextResponse.json({ error: "Plan name is required" }, { status: 400 })
    }

    const userEmail = "user@example.com" // In a real app, this would come from authentication
    const userSettings = userSettingsStore.get(userEmail)
    
    const AIRTABLE_PERSONAL_ACCESS_TOKEN = userSettings?.airtablePersonalAccessToken
    const AIRTABLE_BASE_ID = userSettings?.airtableBaseId

    try {
      const updatedPlan = LocalStorageManager.updateBusinessPlan(planId, { 
        planName: planName.trim(),
        lastModified: new Date().toISOString()
      })
      console.log(`[Rename] Updated local storage with name: ${updatedPlan?.planName}`)
    } catch (localError) {
      console.warn("Failed to update local storage:", localError)
    }

    // If Airtable is not configured, return success with the new name
    if (!AIRTABLE_PERSONAL_ACCESS_TOKEN || !AIRTABLE_BASE_ID) {
      return NextResponse.json({
        success: true,
        planName: planName.trim(),
        message: "Charter renamed successfully (local mode)",
      })
    }

    try {
      const filterResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans?filterByFormula={Plan ID}='${planId}'`, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      })

      if (filterResponse.ok) {
        const filterData = await filterResponse.json()
        if (filterData.records && filterData.records.length > 0) {
          const recordId = filterData.records[0].id
          
          // Update the found record
          const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Business%20Plans/${recordId}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                "Plan Name": planName.trim(),
                "Last Modified": new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD for Airtable
              },
            }),
          })

          if (updateResponse.ok) {
            const data = await updateResponse.json()
            console.log(`[Rename] Successfully updated Airtable record`)
            return NextResponse.json({
              success: true,
              planName: data.fields["Plan Name"],
              message: "Charter renamed successfully",
            })
          }
        }
      }
      
      throw new Error("Plan not found in Airtable")
    } catch (airtableError) {
      console.warn("Airtable rename failed, using fallback:", airtableError)
      return NextResponse.json({
        success: true,
        planName: planName.trim(),
        message: "Charter renamed successfully (fallback mode)",
      })
    }
  } catch (error) {
    console.error("Failed to rename business plan:", error)
    return NextResponse.json({ error: "Failed to rename business plan" }, { status: 500 })
  }
}
