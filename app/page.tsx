"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppHeader } from "@/components/app-header"
import { useUser } from "@/contexts/user-context"
import { getDemoUsers } from "@/lib/user-management"
import {
  FileText,
  Users,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  Star,
  BarChart3,
} from "lucide-react"
import type { User } from "@/lib/user-types"
import type { BusinessPlan } from "@/lib/airtable"

export default function HomePage() {
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, login, isAuthenticated } = useUser()
  const router = useRouter()

  // Initialize with demo user if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      const demoUsers = getDemoUsers()
      login(demoUsers[1]) // Default to regular user
    }
  }, [isAuthenticated, user, login])

  const currentUser = user || getDemoUsers()[1]

  useEffect(() => {
    const fetchPlans = async () => {
      if (!currentUser?.email) return

      try {
        const response = await fetch(`/api/business-plans?owner=${encodeURIComponent(currentUser.email)}`)
        if (response.ok) {
          const data = await response.json()
          setBusinessPlans(data.plans || [])
        }
      } catch (error) {
        console.error("Failed to fetch business plans:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [currentUser?.email])

  const handleUserChange = (newUser: User) => {
    login(newUser)
  }

  const handleCreatePlan = () => {
    router.push("/plans")
  }

  const handleViewPlan = (planId: string, planName: string) => {
    router.push(`/plan/${planId}?name=${encodeURIComponent(planName)}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-green-500"
      case "In Progress":
        return "bg-blue-500"
      case "Submitted for Review":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Complete":
        return "default"
      case "In Progress":
        return "secondary"
      case "Submitted for Review":
        return "outline"
      default:
        return "secondary"
    }
  }

  const recentPlans = businessPlans.slice(0, 3)
  const completedPlans = businessPlans.filter((plan) => plan.status === "Complete").length
  const inProgressPlans = businessPlans.filter((plan) => plan.status === "In Progress").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <AppHeader currentUser={currentUser} onUserChange={handleUserChange} />

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 ring-4 ring-blue-100 dark:ring-blue-900">
              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {currentUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {currentUser.name}!</h1>
              <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Badge variant={currentUser.role === "administrator" ? "destructive" : "secondary"}>
                  {currentUser.role === "administrator" ? "Admin" : "User"}
                </Badge>
                {currentUser.company && <span>• {currentUser.company}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Plans</p>
                  <p className="text-3xl font-bold">{businessPlans.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{completedPlans}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{inProgressPlans}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold">
                    {businessPlans.length > 0 ? Math.round((completedPlans / businessPlans.length) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Plans */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Business Plans
                  </CardTitle>
                  <CardDescription>Your latest business planning projects</CardDescription>
                </div>
                <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Plus className="h-4 w-4 mr-2" />
                  New Plan
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentPlans.length > 0 ? (
                  <div className="space-y-4">
                    {recentPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => handleViewPlan(plan.id!, plan.planName)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(plan.status)}`} />
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{plan.planName}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Updated {new Date(plan.lastModified).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusVariant(plan.status)}>{plan.status}</Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No business plans yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Get started by creating your first business plan
                    </p>
                    <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Features */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/plans")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View All Plans
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/profile")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/settings")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                {currentUser.role === "administrator" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => router.push("/admin")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Platform Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Real-time Collaboration</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Work together with your team in real-time
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Cloud Storage</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Access your plans from anywhere</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Secure & Private</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your data is encrypted and protected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
