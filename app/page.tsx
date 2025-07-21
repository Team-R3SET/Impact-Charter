"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppHeader } from "@/components/app-header"
import { useUser } from "@/contexts/user-context"
import { getDemoUsers } from "@/lib/user-management"
import {
  FileText,
  Plus,
  Users,
  BarChart3,
  Shield,
  Database,
  Activity,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { User } from "@/lib/user-types"

export default function HomePage() {
  const [planName, setPlanName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { user: currentUser, login, isLoading } = useUser()
  const router = useRouter()

  // Initialize with demo user if not authenticated
  useEffect(() => {
    if (!isLoading && !currentUser) {
      const demoUsers = getDemoUsers()
      login(demoUsers[1]) // Default to regular user
    }
  }, [currentUser, isLoading, login])

  const handleCreatePlan = async () => {
    if (!planName.trim()) {
      toast({
        title: "Plan name required",
        description: "Please enter a name for your business plan.",
        variant: "destructive",
      })
      return
    }

    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a business plan.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch("/api/business-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planName: planName.trim(),
          ownerEmail: currentUser.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create business plan")
      }

      const data = await response.json()
      const planId = data.plan.id

      toast({
        title: "Business plan created!",
        description: `"${planName}" has been created successfully.`,
      })

      // Navigate to the new plan
      router.push(`/plan/${planId}?name=${encodeURIComponent(planName)}`)
    } catch (error) {
      console.error("Error creating business plan:", error)
      toast({
        title: "Error",
        description: "Failed to create business plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUserChange = (user: User) => {
    login(user)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please select a demo user to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getDemoUsers().map((user) => (
              <Button
                key={user.id}
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => login(user)}
              >
                <div className="flex items-center gap-3">
                  <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
                  <div className="text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.role}</div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAdmin = currentUser.role === "administrator"

  const features = [
    {
      title: "Business Plan Creation",
      description: "Create and edit comprehensive business plans",
      icon: FileText,
      available: true,
      adminOnly: false,
    },
    {
      title: "Real-time Collaboration",
      description: "Work together with team members in real-time",
      icon: Users,
      available: true,
      adminOnly: false,
    },
    {
      title: "Progress Tracking",
      description: "Monitor completion status of plan sections",
      icon: BarChart3,
      available: true,
      adminOnly: false,
    },
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Shield,
      available: isAdmin,
      adminOnly: true,
    },
    {
      title: "System Logs",
      description: "View access logs and error tracking",
      icon: Activity,
      available: isAdmin,
      adminOnly: true,
    },
    {
      title: "Airtable Integration",
      description: "Debug and manage database connections",
      icon: Database,
      available: isAdmin,
      adminOnly: true,
    },
  ]

  return (
    <>
      <AppHeader currentUser={currentUser} onUserChange={handleUserChange} />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-blue-600 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Business Plan Builder</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Create, collaborate, and manage your business plans with our comprehensive platform
            </p>
          </div>

          {/* Current User Display */}
          <Card className="mb-8 max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img
                  src={currentUser.avatar || "/placeholder.svg"}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <CardTitle className="text-lg">{currentUser.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={isAdmin ? "destructive" : "secondary"}>
                      {isAdmin ? "Administrator" : "Regular User"}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription>{currentUser.email}</CardDescription>
            </CardHeader>
          </Card>

          {/* Create New Plan Section */}
          <Card className="mb-12 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Business Plan
              </CardTitle>
              <CardDescription>Start building your business plan with our guided process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter your business plan name..."
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreatePlan()
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={handleCreatePlan} disabled={isCreating || !planName.trim()} className="px-6">
                  {isCreating ? "Creating..." : "Create Plan"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className={`relative ${!feature.available ? "opacity-60" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <feature.icon className={`w-8 h-8 ${feature.available ? "text-blue-600" : "text-gray-400"}`} />
                      {feature.available ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    {feature.adminOnly && (
                      <Badge variant="outline" className="w-fit">
                        Admin Only
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                    {!feature.available && feature.adminOnly && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                        Switch to Administrator role to access this feature
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Admin Access Section */}
          {isAdmin && (
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <Shield className="w-5 h-5" />
                  Administrator Access
                </CardTitle>
                <CardDescription>
                  You have administrator privileges. Access advanced features and system management.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="destructive" className="flex-1">
                    <a href="/admin" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Access Admin Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 bg-transparent">
                    <a href="/admin/airtable" className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Airtable Debug Tools
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline">
                <a href="/plans" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  View My Plans
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/profile" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Edit Profile
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/settings" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Settings
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
