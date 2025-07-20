"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationsDropdown } from "./notifications-dropdown"
import { ThemeSwitcher } from "./theme-switcher"
import { Building2, Settings, User, LogOut, Shield, FileText, Users } from "lucide-react"

interface AppHeaderProps {
  currentPlan?: {
    id: string
    name: string
  }
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
    role: "administrator" | "regular"
  }
}

export function AppHeader({ currentPlan, user }: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Mock user if none provided
  const currentUser = user || {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "administrator" as const,
    avatar: "/placeholder.svg?height=40&width=40&text=AD",
  }

  const isAdmin = currentUser.role === "administrator"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Building2 className="h-6 w-6" />
            <span className="font-bold">Impact Charter</span>
          </Link>
        </div>

        {currentPlan && (
          <div className="flex items-center space-x-2 mr-4">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{currentPlan.name}</span>
          </div>
        )}

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <Link href="/plans">
              <Button variant="ghost" size="sm">
                My Plans
              </Button>
            </Link>

            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              </Link>
            )}

            <NotificationsDropdown />
            <ThemeSwitcher />

            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                    <AvatarFallback>
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                      {isAdmin && (
                        <Badge variant="secondary" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Manage Users</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  )
}
