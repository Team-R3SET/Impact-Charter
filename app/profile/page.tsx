"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { UserProfileForm } from "@/components/user-profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/contexts/user-context"
import type { User } from "@/lib/user-types"

export default function ProfilePage() {
  const { user, updateUser } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    )
  }

  const handleProfileUpdate = async (updatedUser: User) => {
    setIsLoading(true)
    try {
      // Update the user in the context
      updateUser(updatedUser)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserChange = (newUser: User) => {
    updateUser(newUser)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader currentUser={user} onUserChange={handleUserChange} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Manage your account information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfileForm user={user} onProfileUpdate={handleProfileUpdate} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
