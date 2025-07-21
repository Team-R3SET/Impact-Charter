import { type NextRequest, NextResponse } from "next/server"
import { resetUserPassword, getUserById } from "@/lib/user-management"

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const user = await getUserById(params.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const result = await resetUserPassword(params.userId)

    if (!result.success) {
      return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      temporaryPassword: result.temporaryPassword,
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
