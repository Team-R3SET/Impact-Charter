"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { LivePresenceHeader } from "@/components/live-presence-header"
import { Settings, User, LogOut, Shield, FileText, Home, Plus } from "lucide-react"
import { getCurrentUser, isAdministrator } from "@/lib/user-management"
import type { User as UserType } from "@/lib/user-types"

export function AppHeader() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserType | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setIsAdmin(isAdministrator(currentUser))
      } catch (error) {
        console.error("Failed to load user:", error)
      }
    }
    loadUser()
  }, [])

  const isOnPlanPage = pathname?.startsWith("/plan/")
  const planId = isOnPlanPage ? pathname?.split("/")[2] : null

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xl font-bold">Impact Charter</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/" ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <Home className="h-4 w-4 inline mr-2" />
                Home
              </Link>
              <Link
                href="/plans"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/plans" ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                My Plans
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/admin" ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  <Shield className="h-4 w-4 inline mr-2" />
                  Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Live Presence (only on plan pages) */}
          {isOnPlanPage && planId && (
            <div className="flex-1 flex justify-center">
              <LivePresenceHeader planId={planId} />
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <Link href="/plans">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Plus className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </Link>

            <NotificationsDropdown />
            <ThemeSwitcher />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-white text-blue-600">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  {isAdmin && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      <Shield className="h-3 w-3" />
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name || "User"}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                    {isAdmin && (
                      <Badge variant="outline" className="w-fit">
                        <Shield className="h-3 w-3 mr-1" />
                        Administrator
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
