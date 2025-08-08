import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Simple auth middleware for demonstration
export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = [
    "/admin",
    "/teams",
    "/profile",
    "/settings",
    "/invitations",
  ]

  // API routes that require authentication
  const protectedApiRoutes = [
    "/api/teams",
    "/api/invitations",
    "/api/user-profile",
    "/api/admin",
  ]

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute || isProtectedApiRoute) {
    // In a real app, you would check for valid session/token here
    const authHeader = request.headers.get("authorization")
    const hasValidSession = request.cookies.get("session")

    // For demo purposes, we'll allow access if there's any auth indication
    if (!authHeader && !hasValidSession) {
      if (isProtectedApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      
      // Redirect to login for protected pages
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Admin-only routes middleware
export function adminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // In a real app, you would verify admin role from session/token
    const userRole = request.headers.get("x-user-role")
    
    if (userRole !== "administrator") {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}
