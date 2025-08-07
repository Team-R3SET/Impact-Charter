"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Save, TestTube, CheckCircle, XCircle, ExternalLink, Key, Database, AlertTriangle, Info } from 'lucide-react'
import type { UserSettings, AirtableConnectionTest } from "@/lib/user-settings"

interface UserSettingsFormProps {
  userEmail: string
}

export function UserSettingsForm({ userEmail }: UserSettingsFormProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<AirtableConnectionTest | null>(null)
  const [formData, setFormData] = useState({
    airtablePersonalAccessToken: "",
    airtableBaseId: "",
  })
  const { toast } = useToast()

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(`/api/user-settings?userEmail=${encodeURIComponent(userEmail)}`)
        if (response.ok) {
          const { settings } = await response.json()
          setSettings(settings)
          setFormData({
            airtablePersonalAccessToken: "", // Don't populate masked token
            airtableBaseId: settings.airtableBaseId || "",
          })
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [userEmail, toast])

  const handleTestConnection = async () => {
    if (!formData.airtablePersonalAccessToken || !formData.airtableBaseId) {
      toast({
        title: "Error",
        description: "Please enter both personal access token and Base ID",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/user-settings/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          airtablePersonalAccessToken: formData.airtablePersonalAccessToken,
          airtableBaseId: formData.airtableBaseId,
        }),
      })

      const result = await response.json()
      setTestResult(result)

      if (result.success) {
        toast({
          title: "Success",
          description: "Airtable connection successful!",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      setTestResult({
        success: false,
        message: "Failed to test connection",
      })
      toast({
        title: "Error",
        description: "Failed to test connection",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail,
          airtablePersonalAccessToken: formData.airtablePersonalAccessToken,
          airtableBaseId: formData.airtableBaseId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      const { settings: updatedSettings } = await response.json()
      setSettings(updatedSettings)

      toast({
        title: "Success",
        description: "Settings saved successfully!",
      })

      // Clear the form token field since it will be masked
      setFormData((prev) => ({
        ...prev,
        airtablePersonalAccessToken: "",
      }))
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Airtable Connection Status
          </CardTitle>
          <CardDescription>Current status of your Airtable integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {settings?.isAirtableConnected ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <Badge variant="default" className="bg-green-500">
                  Connected
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Your business plans will be saved to your personal Airtable base
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <Badge variant="destructive">Not Connected</Badge>
                <span className="text-sm text-muted-foreground">Using local storage - data may not persist</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Airtable Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Airtable Configuration
          </CardTitle>
          <CardDescription>Connect your personal Airtable base to save and sync your business plans</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>To get your Airtable credentials:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    Go to{" "}
                    <a
                      href="https://airtable.com/create/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Airtable Developer Hub <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Create a new personal access token with "data.records:read" and "data.records:write" scopes</li>
                  <li>Copy your Base ID from your Airtable base URL (starts with "app")</li>
                  <li>
                    Make sure your base has tables named "Business Plans", "Business Plan Sections", and "User Profiles"
                  </li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="personal-access-token">Personal Access Token</Label>
              <Input
                id="personal-access-token"
                type="password"
                placeholder={settings?.airtablePersonalAccessToken ? "••••••••••••••••" : "Enter your Airtable personal access token"}
                value={formData.airtablePersonalAccessToken}
                onChange={(e) => setFormData((prev) => ({ ...prev, airtablePersonalAccessToken: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Your personal access token from Airtable (starts with "pat")
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-id">Base ID</Label>
              <Input
                id="base-id"
                placeholder="appXXXXXXXXXXXXXX"
                value={formData.airtableBaseId}
                onChange={(e) => setFormData((prev) => ({ ...prev, airtableBaseId: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Your Airtable base ID (found in your base URL, starts with "app")
              </p>
            </div>
          </div>

          {/* Test Connection */}
          <div className="space-y-4">
            <Separator />
            <div className="flex items-center gap-3">
              <Button
                onClick={handleTestConnection}
                disabled={isTesting || !formData.airtablePersonalAccessToken || !formData.airtableBaseId}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <TestTube className="w-4 h-4" />
                {isTesting ? "Testing..." : "Test Connection"}
              </Button>

              {testResult && (
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">{testResult.message}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">{testResult.message}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {testResult?.success && testResult.baseInfo && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p>
                      <strong>Connection successful!</strong>
                    </p>
                    <p className="text-sm">
                      Found {testResult.baseInfo.tables.length} tables: {testResult.baseInfo.tables.join(", ")}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• Your Airtable credentials are stored securely and never shared with third parties</p>
            <p>• Personal access tokens are encrypted and only used to sync your business plan data</p>
            <p>• You can disconnect your Airtable integration at any time</p>
            <p>• Only you have access to your personal business plan data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
