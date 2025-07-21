"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { UserProfileForm } from "@/components/user-profile-form"
import { useUser } from "@/contexts/user-context"
import { getDemoUsers } from "@/lib/user-management"
import type { UserProfile } from "@/lib/airtable"
import type { User } from "@/lib/user-types"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, login, updateUser } = useUser()

  // Initialize with demo user if not authenticated
  useEffect(() => {
    if (!user) {
      const demoUsers = getDemoUsers()
      login(demoUsers[1]) // Default to regular user
    }
  }, [user, login])

  const currentUser = user || getDemoUsers()[1]

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.email) return

      try {
        const response = await fetch(`/api/user-profile?email=${encodeURIComponent(currentUser.email)}`)
        if (response.ok) {
          const data = await response.json()
          setProfile(data.profile)
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [currentUser?.email])

  const handleUserChange = (newUser: User) => {
    login(newUser)
  }

  // Update user context when profile changes
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    updateUser({
      name: updatedProfile.name,
      avatar: updatedProfile.avatar,
      company: updatedProfile.company,
    })
    setProfile(updatedProfile)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppHeader currentUser={currentUser} onUserChange={handleUserChange} />
        <main className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader currentUser={currentUser} onUserChange={handleUserChange} />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your personal information and preferences</p>
        </div>
        <UserProfileForm initialProfile={profile} userEmail={currentUser.email} onProfileUpdate={handleProfileUpdate} />
      </main>
    </div>
  )
}
