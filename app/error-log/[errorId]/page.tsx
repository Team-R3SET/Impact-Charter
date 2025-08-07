"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CheckCircle, ExternalLink, Copy, RefreshCw } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface ErrorLogPageProps {
  params: { errorId: string }
}

export default function ErrorLogPage({ params }: ErrorLogPageProps) {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const planId = searchParams.get("planId")
  const sectionId = searchParams.get("sectionId")
  const error = searchParams.get("error")
  const errorType = searchParams.get("errorType") || "UNKNOWN"

  const copyErrorId = () => {
    navigator.clipboard.writeText(params.errorId)
    toast({
      title: "Copied!",
      description: "Error ID copied to clipboard",
    })
  }

  const getTroubleshootingSteps = (errorType: string) => {
    switch (errorType) {
      case "TABLE_NOT_FOUND":
        return [
          {
            title: "Check Airtable Base Setup",
            description: "Ensure the 'Business Plan Sections' table exists in your Airtable base",
            action: "Go to Airtable",
            link: "https://airtable.com"
          },
          {
            title: "Verify Base ID",
            description: "Check that your AIRTABLE_BASE_ID environment variable is correct",
            action: "Check Settings",
            link: "/settings"
          },
          {
            title: "API Key Permissions",
            description: "Ensure your API key has access to the specified base",
            action: "Verify API Key",
            link: "https://airtable.com/account"
          }
        ]
      case "AUTH_ERROR":
        return [
          {
            title: "Check API Key",
            description: "Verify your Airtable API key is correct and hasn't expired",
            action: "Update API Key",
            link: "/settings"
          },
          {
            title: "Generate New Key",
            description: "If your key has expired, generate a new one from Airtable",
            action: "Airtable Account",
            link: "https://airtable.com/account"
          }
        ]
      case "PERMISSION_ERROR":
        return [
          {
            title: "Check Permissions",
            description: "Ensure your API key has write permissions to the base",
            action: "Review Permissions",
            link: "https://airtable.com/account"
          },
          {
            title: "Contact Admin",
            description: "Ask your workspace admin to grant you access to the table",
            action: "Contact Support",
            link: "/support"
          }
        ]
      default:
        return [
          {
            title: "Check Connection",
            description: "Verify your internet connection is stable",
            action: "Test Connection",
            link: "https://www.google.com"
          },
          {
            title: "Airtable Status",
            description: "Check if Airtable services are experiencing issues",
            action: "Service Status",
            link: "https://status.airtable.com"
          },
          {
            title: "Try Again",
            description: "Wait a few minutes and try the action again",
            action: "Return to Plan",
            link: planId ? `/plan/${planId}` : "/plans"
          }
        ]
    }
  }

  const troubleshootingSteps = getTroubleshootingSteps(errorType)

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto" />
          <h1 className="text-3xl font-bold">Error Troubleshooting Guide</h1>
          <p className="text-muted-foreground">
            We've detected an issue with your business plan section completion. Follow the steps below to resolve it.
          </p>
        </div>

        {/* Error Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Error Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Error ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-muted px-2 py-1 rounded text-sm">{params.errorId}</code>
                  <Button size="sm" variant="ghost" onClick={copyErrorId}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Error Type</label>
                <div className="mt-1">
                  <Badge variant={errorType === "UNKNOWN" ? "secondary" : "destructive"}>
                    {errorType.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              {planId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Plan ID</label>
                  <code className="block bg-muted px-2 py-1 rounded text-sm mt-1">{planId}</code>
                </div>
              )}
              {sectionId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Section</label>
                  <code className="block bg-muted px-2 py-1 rounded text-sm mt-1">{sectionId}</code>
                </div>
              )}
            </div>
            {error && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Error Message</label>
                <div className="bg-red-50 border border-red-200 rounded p-3 mt-1">
                  <code className="text-red-800 text-sm">{error}</code>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Troubleshooting Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Troubleshooting Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {troubleshootingSteps.map((step, index) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                    <Button size="sm" variant="outline" asChild>
                      <a href={step.link} target="_blank" rel="noopener noreferrer">
                        {step.action}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <a href="/settings">
                  Check Settings
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={planId ? `/plan/${planId}` : "/plans"}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/support">
                  Contact Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
