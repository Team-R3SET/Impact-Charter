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
import { Save, TestTube, CheckCircle, XCircle, ExternalLink, Key, Database, AlertTriangle, Info } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import type { AirtableConnectionTest } from "@/lib/user-settings"

export function UserSettingsForm() {
  const { userSettings, updateUserSettings, isLoading: isUserLoading } = useUser()
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<AirtableConnectionTest | null>(null)
  const [formData, setFormData] = useState({
    airtableApiKey: "",
    airtableBaseId: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (userSettings) {
      setFormData({
        airtableApiKey: "", // Always keep this blank for security
        airtableBaseId: userSettings.airtableBaseId || "",
      })
    }
  }, [userSettings])

  const handleTestConnection = async () => {
    if (!formData.airtableApiKey || !formData.airtableBaseId) {
      toast({
        title: "Error",
        description: "Please enter both API key and Base ID to test.",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/user-settings/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          airtableApiKey: formData.airtableApiKey,
          airtableBaseId: formData.airtableBaseId,
        }),
      })

      const result = await response.json()
      setTestResult(result)

      toast({
        title: result.success ? "Success" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      const errorMessage = "Failed to test connection due to a network or server error."
      console.error("Connection test failed:", error)
      setTestResult({ success: false, message: errorMessage })
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    await updateUserSettings({
      airtableApiKey: formData.airtableApiKey,
      airtableBaseId: formData.airtableBaseId,
    })
    // Clear the API key from the form after saving
    setFormData((prev) => ({ ...prev, airtableApiKey: "" }))
    setIsSaving(false)
  }

  if (isUserLoading) {
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
            {userSettings?.isAirtableConnected ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <Badge variant="default" className="bg-green-500">
                  Connected
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Your business plans will be saved to your personal Airtable base.
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <Badge variant="destructive">Not Connected</Badge>
                <span className="text-sm text-muted-foreground">Using local storage - data may not persist.</span>
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
          <CardDescription>Connect your personal Airtable base to save and sync your business plans.</CardDescription>
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
                  <li>Create a new personal access token with `data.records:read` and `data.records:write` scopes.</li>
                  <li>Copy your Base ID from your Airtable base URL (it starts with "app").</li>
                  <li>
                    Ensure your base has tables named "Business Plans", "Business Plan Sections", and "User Profiles".
                  </li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Personal Access Token</Label>
              <Input
                id="api-key"
                type="password"
                placeholder={userSettings?.isAirtableConnected ? "••••••••••••••••" : "Enter your Airtable API key"}
                value={formData.airtableApiKey}
                onChange={(e) => setFormData((prev) => ({ ...prev, airtableApiKey: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Your personal access token from Airtable (starts with "pat").
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
                Your Airtable base ID (found in your base URL, starts with "app").
              </p>
            </div>
          </div>

          {/* Test Connection */}
          <div className="space-y-4">
            <Separator />
            <div className="flex items-center gap-3">
              <Button
                onClick={handleTestConnection}
                disabled={isTesting || !formData.airtableApiKey || !formData.airtableBaseId}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <TestTube className="w-4 h-4" />
                {isTesting ? "Testing..." : "Test Connection"}
              </Button>

              {testResult && (
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm ${testResult.success ? "text-green-600" : "text-red-600"}`}>
                    {testResult.message}
                  </span>
                </div>
              )}
            </div>

            {testResult?.success && testResult.baseInfo && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <p>
                    <strong>Connection successful!</strong> Found {testResult.baseInfo.tables.length} tables:{" "}
                    {testResult.baseInfo.tables.join(", ")}.
                  </p>
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
            <p>• Your Airtable credentials are not stored on our servers for this demo.</p>
            <p>• API keys are only used to sync your business plan data with your Airtable account.</p>
            <p>• You can disconnect your Airtable integration at any time by clearing the settings.</p>
            <p>• Only you have access to your personal business plan data.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
