import Airtable from "airtable"

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID || "")

export interface BusinessPlanSection {
  id: string
  planId: string
  sectionId: string
  content: string
  isCompleted: boolean
  lastModified: string
  lastModifiedBy: string
}

export interface Comment {
  id: string
  planId: string
  sectionId: string
  userId: string
  userName: string
  content: string
  createdAt: string
  updatedAt: string
}

export async function updateBusinessPlanSectionWithUserCreds(
  planId: string,
  sectionId: string,
  content: string,
  userId: string,
  userName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      // Fallback to localStorage for demo
      const key = `section-${planId}-${sectionId}`
      localStorage.setItem(
        key,
        JSON.stringify({
          content,
          lastModified: new Date().toISOString(),
          lastModifiedBy: userName,
        }),
      )
      return { success: true }
    }

    // First, get the business plan
    const planRecord = await base("BusinessPlans").find(planId)
    const sections = JSON.parse((planRecord.get("Sections") as string) || "{}")

    // Update the specific section
    sections[sectionId] = {
      content,
      lastModified: new Date().toISOString(),
      lastModifiedBy: userName,
      userId,
    }

    // Update the business plan record
    await base("BusinessPlans").update(planId, {
      Sections: JSON.stringify(sections),
      UpdatedAt: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating business plan section:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function markBusinessPlanSectionComplete(
  planId: string,
  sectionId: string,
  isCompleted: boolean,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      // Fallback to localStorage for demo
      const key = `section-${planId}-${sectionId}-completed`
      localStorage.setItem(key, isCompleted.toString())
      return { success: true }
    }

    // Get the business plan
    const planRecord = await base("BusinessPlans").find(planId)
    const sections = JSON.parse((planRecord.get("Sections") as string) || "{}")

    // Update completion status
    if (!sections[sectionId]) {
      sections[sectionId] = {}
    }
    sections[sectionId].isCompleted = isCompleted
    sections[sectionId].completedAt = isCompleted ? new Date().toISOString() : null
    sections[sectionId].completedBy = isCompleted ? userId : null

    // Update the business plan record
    await base("BusinessPlans").update(planId, {
      Sections: JSON.stringify(sections),
      UpdatedAt: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error marking section complete:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getBusinessPlanSectionComments(planId: string, sectionId: string): Promise<Comment[]> {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      // Return mock comments for demo
      return [
        {
          id: "mock-comment-1",
          planId,
          sectionId,
          userId: "demo-user",
          userName: "Demo User",
          content: "This section looks good, but consider adding more market research data.",
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]
    }

    const records = await base("Comments")
      .select({
        filterByFormula: `AND({PlanId} = '${planId}', {SectionId} = '${sectionId}')`,
        sort: [{ field: "CreatedAt", direction: "asc" }],
      })
      .all()

    return records.map((record) => ({
      id: record.id,
      planId: record.get("PlanId") as string,
      sectionId: record.get("SectionId") as string,
      userId: record.get("UserId") as string,
      userName: record.get("UserName") as string,
      content: record.get("Content") as string,
      createdAt: record.get("CreatedAt") as string,
      updatedAt: record.get("UpdatedAt") as string,
    }))
  } catch (error) {
    console.error("Error fetching comments:", error)
    return []
  }
}

export async function addBusinessPlanSectionComment(
  planId: string,
  sectionId: string,
  content: string,
  userId: string,
  userName: string,
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    if (!content.trim()) {
      return {
        success: false,
        error: "Comment content cannot be empty",
      }
    }

    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      // Return mock comment for demo
      const mockComment: Comment = {
        id: `mock-${Date.now()}`,
        planId,
        sectionId,
        userId,
        userName,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return {
        success: true,
        comment: mockComment,
      }
    }

    const record = await base("Comments").create({
      PlanId: planId,
      SectionId: sectionId,
      UserId: userId,
      UserName: userName,
      Content: content.trim(),
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    })

    const comment: Comment = {
      id: record.id,
      planId: record.get("PlanId") as string,
      sectionId: record.get("SectionId") as string,
      userId: record.get("UserId") as string,
      userName: record.get("UserName") as string,
      content: record.get("Content") as string,
      createdAt: record.get("CreatedAt") as string,
      updatedAt: record.get("UpdatedAt") as string,
    }

    return {
      success: true,
      comment,
    }
  } catch (error) {
    console.error("Error adding comment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function deleteBusinessPlanSectionComment(
  commentId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return { success: true } // Mock success for demo
    }

    // First verify the user owns the comment
    const record = await base("Comments").find(commentId)
    if (record.get("UserId") !== userId) {
      return {
        success: false,
        error: "You can only delete your own comments",
      }
    }

    await base("Comments").destroy(commentId)
    return { success: true }
  } catch (error) {
    console.error("Error deleting comment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
