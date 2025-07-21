import { type NextRequest, NextResponse } from "next/server"
import { getAllUsers, createUser, searchUsers, filterUsers, getUserStats } from "@/lib/user-management"
import type { User } from "@/lib/user-types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const company = searchParams.get("company")
    const department = searchParams.get("department")
    const stats = searchParams.get("stats")

    // Return stats if requested
    if (stats === "true") {
      const userStats = await getUserStats()
      return NextResponse.json(userStats)
    }

    let users: User[]

    // Handle search
    if (search) {
      users = await searchUsers(search)
    } else {
      users = await getAllUsers()
    }

    // Apply filters
    if (role || status !== null || company || department) {
      const filters: any = {}
      if (role) filters.role = role
      if (status !== null) filters.isActive = status === "active"
      if (company) filters.company = company
      if (department) filters.department = department

      users = await filterUsers(filters)
    }

    // Sort by creation date (newest first)
    users.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // Validate required fields
    if (!userData.name || !userData.email || !userData.role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create user
    const newUser = await createUser({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      company: userData.company,
      department: userData.department,
      isActive: userData.isActive ?? true,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
