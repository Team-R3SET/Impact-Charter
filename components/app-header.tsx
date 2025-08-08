"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Settings, User, LogOut, Database, UsersIcon, BarChart3, Menu, HelpCircle, ChevronDown } from 'lucide-react'
import { useUser } from "@/contexts/user-context"
import { RoleSwitcher } from "./role-switcher"
import { NotificationsDropdown } from "./notifications-dropdown"
import { InvitationNotifications } from "./invitation-notifications"
import { ThemeSwitcher } from "./theme-switcher"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { getDemoUsers } from "@/lib/user-management"
import type { User as UserType } from "@/lib/user-types"

interface BusinessPlan {
  id: string
  planName: string
  lastModified: string
  status: "draft" | "in-progress" | "completed"
}

export function AppHeader() {
  const { user: currentUser, logout, isAdmin, setUser } = useUser()
  const pathname = usePathname()
  const [plans, setPlans] = useState<BusinessPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Fetch user's business plans for quick switcher
  useEffect(() => {
    if (currentUser?.email) {
      fetchPlans()
    }
  }, [currentUser?.email])

  // Add effect to refetch plans when pathname changes to ensure sync
  useEffect(() => {
    if (currentUser?.email && pathname === '/plans') {
      fetchPlans()
    }
  }, [pathname, currentUser?.email])

  const fetchPlans = async () => {
    if (!currentUser?.email) return

    setIsLoading(true)
    try {
      // Remove owner filter to get all user's plans, not just limited by owner
      const response = await fetch(`/api/business-plans?limit=10`)
      if (response.ok) {
        const data = await response.json()
        const plansArray = Array.isArray(data) ? data : data.plans || []
        setPlans(plansArray)

        // Set current plan if we're on a plan page
        const planIdMatch = pathname.match(/\/plan\/([^/]+)/)
        if (planIdMatch && plansArray.length > 0) {
          const currentPlanId = planIdMatch[1]
          const currentPlan = plansArray.find((p) => p.id === currentPlanId)
          if (currentPlan) {
            setSelectedPlan(currentPlan.id)
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId)
    window.location.href = `/plan/${planId}`
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const handleUserChange = (user: UserType) => {
    setUser(user)
    // Refresh the page to update all components with new user context
    window.location.reload()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "in-progress":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  const navigationItems = [
    { href: "/", label: "Home" },
    ...(currentUser ? [{ href: "/plans", label: "My Charters" }] : []),
    ...(currentUser ? [{ href: "/teams", label: "Teams" }] : []),
    { href: "/pricing", label: "Pricing" },
    { href: "/setup/airtable", label: "Setup Guide" },
    { href: "/settings", label: "Settings" },
  ]

  const adminItems = [
    { href: "/admin", label: "Admin Dashboard", icon: BarChart3 },
    { href: "/admin/users", label: "User Management", icon: UsersIcon },
    { href: "/admin/airtable", label: "Airtable Debug", icon: Database },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Enhanced logo with better spacing and visual hierarchy */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Impact Charter
            </span>
          </Link>

          {/* Improved desktop navigation with better hover states */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-muted/50 ${
                  pathname === item.href 
                    ? "text-primary bg-primary/10 shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Enhanced right side with better spacing and visual consistency */}
          <div className="flex items-center space-x-3">
            {/* Improved plan switcher with better styling */}
            {currentUser && plans.length > 0 && pathname.startsWith("/plan/") && (
              <div className="hidden lg:block">
                <Select value={selectedPlan} onValueChange={handlePlanChange}>
                  <SelectTrigger className="w-52 h-9 bg-background border-border/60 hover:border-border transition-colors">
                    <SelectValue placeholder="Select a Charter..." />
                  </SelectTrigger>
                  <SelectContent className="w-52">
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id} className="cursor-pointer">
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate font-medium">{plan.planName}</span>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 text-xs font-medium ${getStatusColor(plan.status)}`}
                          >
                            {plan.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Better spacing for theme switcher */}
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>

            {/* Improved mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-2 mt-8">
                  {/* Better mobile navigation styling */}
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                        pathname === item.href 
                          ? "text-primary bg-primary/10" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {!currentUser && (
                    <>
                      <div className="border-t pt-4 mt-4 space-y-2">
                        <Link
                          href="/login"
                          className="block text-sm font-medium transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          className="block text-sm font-medium transition-colors px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Get Started
                        </Link>
                      </div>
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <div className="border-t pt-4 mt-4 space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground px-3 mb-2">Admin</p>
                        {adminItems.map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center text-sm font-medium transition-colors px-3 py-2 rounded-md hover:bg-muted/50"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Icon className="w-4 h-4 mr-3" />
                              {item.label}
                            </Link>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Enhanced user section with better visual hierarchy */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                {/* Improved role switcher positioning */}
                <div className="hidden sm:block">
                  <RoleSwitcher 
                    currentUser={currentUser}
                    onUserChange={handleUserChange}
                    availableUsers={getDemoUsers()}
                  />
                </div>

                <div className="hidden sm:block">
                  <InvitationNotifications 
                    currentUser={currentUser}
                    onInvitationUpdate={fetchPlans}
                  />
                </div>

                {/* Better notifications positioning */}
                <div className="hidden sm:block">
                  <NotificationsDropdown />
                </div>

                {/* Enhanced user dropdown with better styling */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted/50 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                        <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">
                          {currentUser.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2">
                        <p className="text-sm font-semibold leading-none">{currentUser.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                        {isAdmin && (
                          <Badge variant="secondary" className="w-fit text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-3 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/plans" className="cursor-pointer">
                        <FileText className="mr-3 h-4 w-4" />
                        My Charters
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/teams" className="cursor-pointer">
                        <UsersIcon className="mr-3 h-4 w-4" />
                        Teams
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/invitations" className="cursor-pointer">
                        <FileText className="mr-3 h-4 w-4" />
                        Invitations
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/setup/airtable" className="cursor-pointer">
                        <HelpCircle className="mr-3 h-4 w-4" />
                        Setup Guide
                      </Link>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Admin</DropdownMenuLabel>
                        {adminItems.map((item) => {
                          const Icon = item.icon
                          return (
                            <DropdownMenuItem key={item.href} asChild>
                              <Link href={item.href} className="cursor-pointer">
                                <Icon className="mr-3 h-4 w-4" />
                                {item.label}
                              </Link>
                            </DropdownMenuItem>
                          )
                        })}
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-3 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button variant="ghost" size="sm" asChild className="h-9">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="h-9">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
