import { NextResponse } from "next/server"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function createApiResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  )
}

export function createSuccessResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  )
}

export function createErrorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  )
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} is required`
  }
  return null
}

export function handleApiError(error: any): NextResponse {
  console.error("API Error:", error)

  if (error.message) {
    return createErrorResponse(error.message, 500)
  }

  return createErrorResponse("Internal server error", 500)
}
