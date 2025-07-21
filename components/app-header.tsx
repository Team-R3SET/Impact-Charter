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
import { FileText, Settings, User, LogOut, Database, UsersIcon, BarChart3, Menu } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { RoleSwitcher } from "./role-switcher"
import { NotificationsDropdown } from "./notifications-dropdown"
import { ThemeSwitcher } from "./theme-switcher"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface BusinessPlan {
  id: string
  planName: string
  lastModified: string
  status: "draft" | "in-progress" | "completed"
}

export function AppHeader() {
  const { currentUser, logout, isAdmin } = useUser()
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

  const fetchPlans = async () => {
    if (!currentUser?.email) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/business-plans?limit=5&owner=${encodeURIComponent(currentUser.email)}`)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/plans", label: "My Plans" },
    { href: "/pricing", label: "Pricing" },
    { href: "/settings", label: "Settings" },
  ]

  const adminItems = [
    { href: "/admin", label: "Admin Dashboard", icon: BarChart3 },
    { href: "/admin/users", label: "User Management", icon: UsersIcon },
    { href: "/admin/airtable", label: "Airtable Debug", icon: Database },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Impact Charter
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Plan Switcher - Only show if user has plans and is on a plan page */}
            {currentUser && plans.length > 0 && pathname.startsWith("/plan/") && (
              <div className="hidden lg:block">
                <Select value={selectedPlan} onValueChange={handlePlanChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select a plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{plan.planName}</span>
                          <Badge variant="secondary" className={`ml-2 text-xs ${getStatusColor(plan.status)}`}>
                            {plan.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-sm font-medium transition-colors hover:text-primary p-2 rounded-md ${
                        pathname === item.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {!currentUser && (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <Link
                          href="/login"
                          className="block text-sm font-medium transition-colors hover:text-primary p-2 rounded-md hover:bg-muted"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          className="block text-sm font-medium transition-colors hover:text-primary p-2 rounded-md hover:bg-muted"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </div>
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Admin</p>
                        {adminItems.map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center text-sm font-medium transition-colors hover:text-primary p-2 rounded-md hover:bg-muted"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Icon className="w-4 h-4 mr-2" />
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

            {/* User Menu or Auth Buttons */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                {/* Role Switcher - Fixed Integration */}
                <RoleSwitcher className="hidden sm:flex" />

                {/* Notifications */}
                <NotificationsDropdown />

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                        <AvatarFallback>
                          {currentUser.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                        {isAdmin && (
                          <Badge variant="secondary" className="w-fit text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Mobile Role Switcher */}
                    <div className="sm:hidden px-2 py-1">
                      <RoleSwitcher />
                    </div>
                    <DropdownMenuSeparator className="sm:hidden" />

                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/plans" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        My Plans
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        {adminItems.map((item) => {
                          const Icon = item.icon
                          return (
                            <DropdownMenuItem key={item.href} asChild>
                              <Link href={item.href} className="cursor-pointer w-full">
                                <Icon className="mr-2 h-4 w-4" />
                                {item.label}
                              </Link>
                            </DropdownMenuItem>
                          )
                        })}
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
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
