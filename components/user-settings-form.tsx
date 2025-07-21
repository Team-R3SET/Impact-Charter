"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, User, Bell, Shield, Link, AlertTriangle, CheckCircle } from "lucide-react"

interface UserSettingsFormProps {
  userId: string
  initialData?: any
}

interface FormErrors {
  [key: string]: string
}

export function UserSettingsForm({ userId, initialData }: UserSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()

  // Profile settings
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    company: "",
    role: "user",
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    comments: true,
    mentions: true,
    weeklyDigest: false,
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    allowCollaboration: true,
  })

  // Integration settings
  const [integrations, setIntegrations] = useState({
    airtable: {
      connected: false,
      apiKey: "",
      baseId: "",
    },
    liveblocks: {
      connected: false,
    },
  })

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      setErrors({})

      try {
        const response = await fetch(`/api/user-settings?userId=${userId}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to load settings")
        }

        if (result.success && result.data) {
          const data = result.data
          setProfile({
            name: data.profile?.name || "",
            email: data.profile?.email || "",
            bio: data.profile?.bio || "",
            company: data.profile?.company || "",
            role: data.profile?.role || "user",
          })
          setNotifications(data.notifications || notifications)
          setPrivacy(data.privacy || privacy)
          setIntegrations(data.integrations || integrations)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load settings"
        setErrors({ general: errorMessage })
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadSettings()
    }
  }, [userId, toast])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Profile validation
    if (!profile.name.trim()) {
      newErrors.name = "Name is required"
    } else if (profile.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!profile.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = "Invalid email format"
    }

    if (profile.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters"
    }

    if (profile.company.length > 100) {
      newErrors.company = "Company name must be less than 100 characters"
    }

    // Integration validation
    if (integrations.airtable.apiKey && integrations.airtable.apiKey.length < 10) {
      newErrors.airtableApiKey = "Airtable API key appears to be invalid"
    }

    if (integrations.airtable.baseId && !/^app[a-zA-Z0-9]{14}$/.test(integrations.airtable.baseId)) {
      newErrors.airtableBaseId = "Airtable Base ID format is invalid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setErrors({})

    try {
      const settingsData = {
        profile,
        notifications,
        privacy,
        integrations,
      }

      const response = await fetch("/api/user-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          settings: settingsData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.code === "VALIDATION_ERROR" && result.details?.validationErrors) {
          const validationErrors: FormErrors = {}
          result.details.validationErrors.forEach((error: any) => {
            validationErrors[error.field] = error.message
          })
          setErrors(validationErrors)
        }
        throw new Error(result.error || "Failed to save settings")
      }

      setHasUnsavedChanges(false)
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings"
      setErrors({ general: errorMessage })
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleProfileChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handlePrivacyChange = (field: string, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleIntegrationChange = (integration: string, field: string, value: any) => {
    setIntegrations((prev) => ({
      ...prev,
      [integration]: {
        ...prev[integration as keyof typeof prev],
        [field]: value,
      },
    }))
    setHasUnsavedChanges(true)
    // Clear integration-specific errors
    const errorKey = `${integration}${field.charAt(0).toUpperCase() + field.slice(1)}`
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }))
    }
  }

  const testAirtableConnection = async () => {
    if (!integrations.airtable.apiKey || !integrations.airtable.baseId) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both API key and Base ID to test the connection.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/airtable/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: integrations.airtable.apiKey,
          baseId: integrations.airtable.baseId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Connection Successful",
          description: "Airtable connection is working correctly.",
        })
        handleIntegrationChange("airtable", "connected", true)
      } else {
        throw new Error(result.error || "Connection test failed")
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Airtable",
        variant: "destructive",
      })
      handleIntegrationChange("airtable", "connected", false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <CardTitle>Loading Settings...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {errors.general && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => handleProfileChange("company", e.target.value)}
                  placeholder="Enter your company name"
                  className={errors.company ? "border-red-500" : ""}
                />
                {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  className={`min-h-[100px] ${errors.bio ? "border-red-500" : ""}`}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{errors.bio && <span className="text-red-500">{errors.bio}</span>}</span>
                  <span>{profile.bio.length}/500</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comment Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when someone comments on your plans</p>
                </div>
                <Switch
                  checked={notifications.comments}
                  onCheckedChange={(checked) => handleNotificationChange("comments", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mention Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when someone mentions you</p>
                </div>
                <Switch
                  checked={notifications.mentions}
                  onCheckedChange={(checked) => handleNotificationChange("mentions", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary of activity</p>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(checked) => handleNotificationChange("weeklyDigest", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and visibility preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => handlePrivacyChange("profileVisible", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Email Address</Label>
                  <p className="text-sm text-muted-foreground">Display your email address on your profile</p>
                </div>
                <Switch
                  checked={privacy.showEmail}
                  onCheckedChange={(checked) => handlePrivacyChange("showEmail", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Collaboration</Label>
                  <p className="text-sm text-muted-foreground">Allow others to invite you to collaborate on plans</p>
                </div>
                <Switch
                  checked={privacy.allowCollaboration}
                  onCheckedChange={(checked) => handlePrivacyChange("allowCollaboration", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect external services to enhance your experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      Airtable Integration
                      {integrations.airtable.connected && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </Label>
                    <p className="text-sm text-muted-foreground">Connect your Airtable base for data synchronization</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    <Label htmlFor="airtable-api-key">API Key</Label>
                    <Input
                      id="airtable-api-key"
                      type="password"
                      value={integrations.airtable.apiKey}
                      onChange={(e) => handleIntegrationChange("airtable", "apiKey", e.target.value)}
                      placeholder="Enter your Airtable API key"
                      className={errors.airtableApiKey ? "border-red-500" : ""}
                    />
                    {errors.airtableApiKey && <p className="text-sm text-red-500">{errors.airtableApiKey}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="airtable-base-id">Base ID</Label>
                    <Input
                      id="airtable-base-id"
                      value={integrations.airtable.baseId}
                      onChange={(e) => handleIntegrationChange("airtable", "baseId", e.target.value)}
                      placeholder="Enter your Airtable Base ID (e.g., appXXXXXXXXXXXXXX)"
                      className={errors.airtableBaseId ? "border-red-500" : ""}
                    />
                    {errors.airtableBaseId && <p className="text-sm text-red-500">{errors.airtableBaseId}</p>}
                  </div>

                  <Button
                    onClick={testAirtableConnection}
                    variant="outline"
                    size="sm"
                    disabled={!integrations.airtable.apiKey || !integrations.airtable.baseId}
                  >
                    Test Connection
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      Liveblocks Integration
                      {integrations.liveblocks.connected && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </Label>
                    <p className="text-sm text-muted-foreground">Real-time collaboration features</p>
                  </div>
                </div>

                <div className="pl-4 border-l-2 border-gray-200">
                  <p className="text-sm text-muted-foreground">
                    {integrations.liveblocks.connected
                      ? "Liveblocks is connected and ready for real-time collaboration."
                      : "Liveblocks integration is not configured. Contact your administrator."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {hasUnsavedChanges && (
            <>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              You have unsaved changes
            </>
          )}
        </div>
        <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
