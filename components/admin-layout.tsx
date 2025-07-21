"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Shield, Database, Users, Activity, Settings, ChevronLeft, Menu, X } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/user-types"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
  requiresPermission?: string[]
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: Shield,
    description: "Admin dashboard overview",
  },
  {
    id: "users",
    label: "User Management",
    href: "/admin/users",
    icon: Users,
    description: "Manage users and permissions",
    badge: "Soon",
  },
  {
    id: "airtable",
    label: "Airtable Debug",
    href: "/admin/airtable",
    icon: Database,
    description: "Debug Airtable connections",
  },
  {
    id: "logs",
    label: "System Logs",
    href: "/admin/logs",
    icon: Activity,
    description: "View system activity logs",
  },
  {
    id: "settings",
    label: "System Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Configure system settings",
    badge: "Soon",
  },
]

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { user, isAuthenticated, isLoading } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<string>("")
  const pathname = usePathname()
  const router = useRouter()

  // Determine active navigation item based on current path
  useEffect(() => {
    const currentItem = navigationItems.find((item) => {
      if (item.href === "/admin" && pathname === "/admin") {
        return true
      }
      return pathname.startsWith(item.href) && item.href !== "/admin"
    })
    setActiveItem(currentItem?.id || "")
  }, [pathname])

  // Check admin permissions
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || user.role !== "administrator")) {
      router.push("/")
    }
  }, [isAuthenticated, user, isLoading, router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.role !== "administrator") {
    return null
  }

  const handleUserChange = (newUser: User) => {
    // Handle user change if needed
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <AppHeader currentUser={user} onUserChange={handleUserChange} />

        <div className="flex">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">Admin Panel</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Admin Badge */}
              <div className="p-4 hidden lg:block">
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">Administrator Panel</span>
                </div>
              </div>

              {/* Navigation */}
              <ScrollArea className="flex-1 px-4">
                <nav className="space-y-2 py-4">
                  {navigationItems.map((item) => {
                    const isActive = activeItem === item.id
                    const Icon = item.icon

                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              isActive
                                ? "bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                            )}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </nav>
              </ScrollArea>

              {/* Back to Main App */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Main App
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:ml-0">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Admin</span>
              </div>
            </div>

            {/* Page Content */}
            <div className="p-6">
              {/* Page Header */}
              {(title || description) && (
                <div className="mb-6">
                  {title && <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>}
                  {description && <p className="text-gray-600 dark:text-gray-400">{description}</p>}
                  <Separator className="mt-4" />
                </div>
              )}

              {/* Page Content */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
