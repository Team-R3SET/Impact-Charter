import { NextResponse } from "next/server"

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface ApiResponse<T = any> {
  data?: T
  error?: ApiError
  success: boolean
}

export function createApiResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    {
      data,
      success: true,
    } as ApiResponse<T>,
    { status },
  )
}

export function createApiError(message: string, status = 500, code?: string, details?: any): NextResponse {
  return NextResponse.json(
    {
      error: {
        message,
        code,
        details,
      },
      success: false,
    } as ApiResponse,
    { status },
  )
}

export function handleApiError(error: unknown, defaultMessage = "An error occurred"): NextResponse {
  console.error("API Error:", error)

  if (error instanceof Error) {
    return createApiError(error.message, 500, "INTERNAL_ERROR", { stack: error.stack })
  }

  return createApiError(defaultMessage, 500, "UNKNOWN_ERROR")
}

export function validateRequired(data: Record<string, any>, requiredFields: string[]): string[] {
  const missing: string[] = []
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === "string" && !data[field].trim())) {
      missing.push(field)
    }
  }
  return missing
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const createSuccessResponse = createApiResponse
export const createErrorResponse = createApiError
