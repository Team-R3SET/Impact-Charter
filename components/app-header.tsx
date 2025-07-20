"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, User, Settings, LogOut, Home } from "lucide-react"
import type { BusinessPlan } from "@/lib/airtable"

interface AppHeaderProps {
  currentUser: {
    name: string
    email: string
    avatar?: string
  }
  currentPlanId?: string
}

export function AppHeader({ currentUser, currentPlanId }: AppHeaderProps) {
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Fetch business plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`/api/business-plans?owner=${encodeURIComponent(currentUser.email)}`)
        if (response.ok) {
          const { plans } = await response.json()
          setBusinessPlans(plans)
        }
      } catch (error) {
        console.error("Failed to fetch business plans:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [currentUser.email])

  const currentPlan = businessPlans.find((plan) => plan.id === currentPlanId)

  const handlePlanChange = (planId: string) => {
    const plan = businessPlans.find((p) => p.id === planId)
    if (plan) {
      router.push(`/plan/${planId}?name=${encodeURIComponent(plan.planName)}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-green-500"
      case "In Progress":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Logo/Home */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="w-6 h-6 text-blue-600" />
          <span className="hidden sm:inline">Business Plan Builder</span>
        </Link>

        {/* Plan Selector */}
        {pathname.startsWith("/plan/") && (
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Select value={currentPlanId} onValueChange={handlePlanChange} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "Loading plans..." : "Select a business plan"} />
              </SelectTrigger>
              <SelectContent>
                {businessPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id!}>
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(plan.status)}`} />
                      <span className="truncate">{plan.planName}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {plan.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 ml-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/plans">
              <FileText className="w-4 h-4 mr-2" />
              My Plans
            </Link>
          </Button>
        </nav>

        {/* Create New Plan Button */}
        <Button size="sm" asChild className="hidden sm:flex">
          <Link href="/">
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Link>
        </Button>

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
              <Link href="/plans">
                <FileText className="mr-2 h-4 w-4" />
                <span>My Plans</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
