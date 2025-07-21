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
  currentUser?: {
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
      if (!currentUser?.email) {
        setIsLoadingPlans(false)
        return
      }

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

    fetchRecentPlans()
  }, [currentUser?.email])

  const isAdminPage = pathname?.startsWith("/admin")
  const isPlanPage = pathname?.startsWith("/plan/")
  const isHomePage = pathname === "/"

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
    <header
      className={`sticky top-0 z-50 w-full border-b ${isHomePage ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md" : "bg-background/95 backdrop-blur"} supports-[backdrop-filter]:bg-background/60`}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PlanBuilder
            </span>
          </Link>

          {/* Navigation Links */}
          {!isAdminPage && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/features"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="/templates"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Templates
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Pricing
              </Link>
            </nav>
          )}

          {/* Quick Plan Switcher - Only show for authenticated users */}
          {currentUser && !isAdminPage && !isHomePage && (
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
          {/* CTA for non-authenticated users */}
          {!currentUser && (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/plans">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/plans">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Get Started Free
                </Button>
              </Link>
            </div>
          )}

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Role Switcher (Demo Mode) - Only for authenticated users */}
          {currentUser && (
            <RoleSwitcher currentUser={currentUser} availableUsers={availableUsers} onUserChange={onUserChange} />
          )}

          {/* Notifications - Only for authenticated users */}
          {currentUser && <NotificationsDropdown />}

          {/* User Menu - Only for authenticated users */}
          {currentUser && (
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
                <DropdownMenuItem onClick={() => router.push("/plans")}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>My Plans</span>
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
          )}
        </div>
      </div>
    </header>
  )
}
