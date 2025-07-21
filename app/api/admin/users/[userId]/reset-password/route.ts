import { type NextRequest, NextResponse } from "next/server"
import { resetUserPassword } from "@/lib/user-management"

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const temporaryPassword = await resetUserPassword(params.userId)

    return NextResponse.json({
      message: "Password reset successfully",
      temporaryPassword,
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
