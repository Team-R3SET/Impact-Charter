"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Save, Upload, User } from "lucide-react"
import type { UserProfile } from "@/lib/airtable"

interface UserProfileFormProps {
  initialProfile: UserProfile | null
  userEmail: string
  onProfileUpdate?: (profile: UserProfile) => void
}

export function UserProfileForm({ initialProfile, userEmail, onProfileUpdate }: UserProfileFormProps) {
  const [profile, setProfile] = useState({
    name: initialProfile?.name || "",
    email: userEmail,
    company: initialProfile?.company || "",
    role: initialProfile?.role || "",
    bio: initialProfile?.bio || "",
    avatar: initialProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`,
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/user-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profile,
          id: initialProfile?.id,
          lastModified: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save profile")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })

      // Call the callback to update parent state
      if (onProfileUpdate && data.profile) {
        onProfileUpdate(data.profile)
      }

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const generateNewAvatar = () => {
    const seed = Math.random().toString(36).substring(7)
    setProfile((prev) => ({
      ...prev,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
    }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details and profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="text-lg">{profile.name.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm" onClick={generateNewAvatar}>
                <Upload className="w-4 h-4 mr-2" />
                Generate New Avatar
              </Button>
              <p className="text-xs text-muted-foreground mt-1">Click to generate a new random avatar</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email} disabled className="bg-muted" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => setProfile((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={profile.role}
                onChange={(e) => setProfile((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="Your job title or role"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us a bit about yourself..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
