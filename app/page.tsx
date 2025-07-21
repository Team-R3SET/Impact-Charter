"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppHeader } from "@/components/app-header"
import { RoleSwitcher } from "@/components/role-switcher"
import { useUser } from "@/contexts/user-context"
import { FileText, Users, Zap, Shield, ArrowRight, Play } from "lucide-react"
import type { User } from "@/lib/user-types"

export default function HomePage() {
  const { user, isAuthenticated, login } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickDemo = async () => {
    setIsLoading(true)
    try {
      // Simulate demo user login
      const demoUser: User = {
        id: "demo-user",
        name: "Demo User",
        email: "demo@example.com",
        role: "regular",
        company: "Demo Company",
        department: "Marketing",
        createdDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
        isActive: true,
        avatar: "/placeholder-user.jpg",
      }

      login(demoUser)

      // Small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Demo login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserChange = (newUser: User) => {
    // Handle user change if needed
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <AppHeader currentUser={user} onUserChange={handleUserChange} />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Build Your Business Plan
            <span className="text-blue-600 dark:text-blue-400"> Together</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Collaborate in real-time with your team to create comprehensive business plans. Track progress, share
            insights, and bring your vision to life.
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={handleQuickDemo} disabled={isLoading}>
                <Play className="w-5 h-5 mr-2" />
                {isLoading ? "Starting Demo..." : "Try Quick Demo"}
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/plans">
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild>
                <Link href="/plans">
                  View My Plans <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/profile">Manage Profile</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Role Visualization for Authenticated Users */}
        {isAuthenticated && user && (
          <div className="mb-16">
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  {user.role === "administrator" ? (
                    <Shield className="w-5 h-5 text-red-500" />
                  ) : (
                    <Users className="w-5 h-5 text-blue-500" />
                  )}
                  Welcome, {user.name}!
                </CardTitle>
                <CardDescription>
                  You are currently logged in as a{" "}
                  <Badge variant={user.role === "administrator" ? "destructive" : "default"}>
                    {user.role === "administrator" ? "Administrator" : "Regular User"}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <RoleSwitcher />
                </div>

                {user.role === "administrator" && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      As an administrator, you have access to advanced features:
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/admin">
                        <Shield className="w-4 h-4 mr-2" />
                        Access Admin Dashboard
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Structured Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Follow proven business plan templates with guided sections for executive summary, market analysis,
                financial projections, and more.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Real-time Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Work together with your team in real-time. See live cursors, instant updates, and collaborate seamlessly
                across all sections.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Smart Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Auto-save, progress tracking, export options, and intelligent suggestions to help you create
                comprehensive business plans.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-blue-600 dark:bg-blue-700 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-blue-100">
                Join thousands of entrepreneurs who trust our platform for their business planning needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/plans">
                  Create Your First Plan <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
