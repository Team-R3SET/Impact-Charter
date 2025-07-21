"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppHeader } from "@/components/app-header"
import { getDemoUsers, isAdministrator } from "@/lib/user-management"
import { FileText, Plus, Users, BarChart3, Shield, AlertCircle, CheckCircle } from "lucide-react"
import type { User } from "@/lib/user-types"

export default function HomePage() {
  const demoUsers = getDemoUsers()
  const [currentUser, setCurrentUser] = useState<User>(demoUsers[1]) // Start with regular user

  const isAdmin = isAdministrator(currentUser)

  const handleUserChange = (user: User) => {
    setCurrentUser(user)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <AppHeader currentUser={currentUser} onUserChange={handleUserChange} />

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Business Plan Builder</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Create comprehensive business plans with collaborative editing, real-time updates, and professional
            templates.
          </p>

          {/* Current User Info */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {currentUser.name.charAt(0)}
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{currentUser.name}</span>
              <Badge variant={isAdmin ? "destructive" : "secondary"}>
                {isAdmin ? "Administrator" : "Regular User"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/plans">
                <Plus className="w-5 h-5 mr-2" />
                Create New Plan
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/plans">
                <FileText className="w-5 h-5 mr-2" />
                View My Plans
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Professional Templates</CardTitle>
              <CardDescription>
                Start with industry-standard business plan templates and customize them to your needs.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Real-time Collaboration</CardTitle>
              <CardDescription>
                Work together with your team in real-time with live editing and presence indicators.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Monitor completion status and track progress across all sections of your business plan.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Role-based Features */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Regular User Features */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-blue-900 dark:text-blue-100">Available Features</CardTitle>
                <Badge variant="secondary">Current Access</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Create and edit business plans</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Real-time collaboration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Export and sharing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Profile management</span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Features */}
          <Card
            className={`border-2 ${isAdmin ? "border-red-200 dark:border-red-800" : "border-gray-200 dark:border-gray-700 opacity-60"}`}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                <CardTitle className="text-red-900 dark:text-red-100">Administrator Features</CardTitle>
                {isAdmin ? (
                  <Badge variant="destructive">Admin Access</Badge>
                ) : (
                  <Badge variant="outline">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Admin Only
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={isAdmin ? "" : "text-gray-500"}>User management and roles</span>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={isAdmin ? "" : "text-gray-500"}>System logs and monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={isAdmin ? "" : "text-gray-500"}>Airtable integration management</span>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={isAdmin ? "" : "text-gray-500"}>Error tracking and resolution</span>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={isAdmin ? "" : "text-gray-500"}>System configuration</span>
              </div>

              {isAdmin && (
                <div className="pt-4 border-t">
                  <Button asChild className="w-full bg-red-600 hover:bg-red-700">
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

        {/* Demo Instructions */}
        <div className="mt-16 text-center">
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Demo Mode</h3>
              </div>
              <p className="text-amber-800 dark:text-amber-200 mb-4">
                Use the <strong>Users icon</strong> in the header to switch between Administrator and Regular User roles
                to explore different features and permissions.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-amber-700 dark:text-amber-300">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Switch roles in header</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>Admin features when switched</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
