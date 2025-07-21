"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ChevronDown, Settings, User, LogOut, Plus, FileText, Shield, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { NotificationsDropdown } from "./notifications-dropdown"
import { RoleSwitcher } from "./role-switcher"
import { ThemeSwitcher } from "./theme-switcher"
import type { BusinessPlan } from "@/lib/airtable"

interface AppHeaderProps {
  currentUser: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  availableUsers?: Array<{
    id: string
    name: string
    email: string
    avatar?: string
    role?: string
  }>
  onUserChange?: (user: any) => void
}

export function AppHeader({ currentUser, availableUsers, onUserChange }: AppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [recentPlans, setRecentPlans] = useState<BusinessPlan[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)

  // Fetch recent plans for the current user
  useEffect(() => {
    const fetchRecentPlans = async () => {
      try {
        setIsLoadingPlans(true)
        const response = await fetch(`/api/business-plans?owner=${encodeURIComponent(currentUser.email)}&limit=5`)

        if (response.ok) {
          const data = await response.json()
          const plans = Array.isArray(data) ? data : Array.isArray(data?.plans) ? data.plans : []
          setRecentPlans(plans.slice(0, 5)) // Limit to 5 most recent
        } else {
          console.warn("Failed to fetch recent plans for header")
          setRecentPlans([])
        }
      } catch (error) {
        console.error("Error fetching recent plans:", error)
        setRecentPlans([])
      } finally {
        setIsLoadingPlans(false)
      }
    }

    if (currentUser?.email) {
      fetchRecentPlans()
    }
  }, [currentUser?.email])

  const isAdminPage = pathname?.startsWith("/admin")
  const isPlanPage = pathname?.startsWith("/plan/")

  const handlePlanSelect = (planId: string) => {
    router.push(`/plan/${planId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Submitted for Review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">PlanBuilder</span>
          </Link>

          {/* Quick Plan Switcher */}
          {!isAdminPage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Quick Switch</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Recent Plans
                  <Link href="/plans">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isLoadingPlans ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Loading plans...</div>
                ) : recentPlans.length > 0 ? (
                  <>
                    {recentPlans.map((plan) => (
                      <DropdownMenuItem
                        key={plan.id}
                        onClick={() => handlePlanSelect(plan.id!)}
                        className="flex items-center justify-between p-3 cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{plan.planName}</div>
                          <div className="text-xs text-muted-foreground">
                            Modified {new Date(plan.lastModified).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant="secondary" className={`ml-2 text-xs ${getStatusColor(plan.status)}`}>
                          {plan.status}
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/plans")} className="text-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Plan
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="p-4 text-center text-sm text-muted-foreground">No plans found</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/plans")} className="text-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Plan
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Role Switcher (Demo Mode) */}
          <RoleSwitcher currentUser={currentUser} availableUsers={availableUsers} onUserChange={onUserChange} />

          {/* Notifications */}
          <NotificationsDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                  {currentUser.role && (
                    <Badge variant="secondary" className="w-fit text-xs">
                      {currentUser.role}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Admin Access */}
              <DropdownMenuItem onClick={() => router.push("/admin")}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/admin/airtable")}>
                <Database className="mr-2 h-4 w-4" />
                <span>Airtable Debug</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
