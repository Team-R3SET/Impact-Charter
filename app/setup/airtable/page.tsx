"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AppHeader } from "@/components/app-header"
import { Database, ExternalLink, Copy, CheckCircle, AlertCircle, Eye, EyeOff, ArrowRight, ArrowLeft, Settings, Key, Table, LinkIcon } from 'lucide-react'
import Link from "next/link"

export default function AirtableSetupPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [apiKey, setApiKey] = useState("")
  const [baseId, setBaseId] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const steps = [
    {
      id: "account",
      title: "Create Airtable Account",
      description: "Set up your Airtable account if you don't have one",
      icon: <Settings className="w-6 h-6" />
    },
    {
      id: "api-key",
      title: "Generate API Key",
      description: "Get your personal API key from Airtable",
      icon: <Key className="w-6 h-6" />
    },
    {
      id: "base",
      title: "Create Base",
      description: "Set up your business planning base structure",
      icon: <Table className="w-6 h-6" />
    },
    {
      id: "connect",
      title: "Connect to Platform",
      description: "Link your Airtable base to Impact Charter",
      icon: <LinkIcon className="w-6 h-6" />
    }
  ]

  const tableStructures = [
    {
      name: "Business Plans",
      description: "Main table for storing business plan information",
      fields: [
        { name: "Plan ID", type: "Single line text", description: "Unique identifier" },
        { name: "Plan Name", type: "Single line text", description: "Business plan title" },
        { name: "Owner", type: "Single line text", description: "Plan owner email" },
        { name: "Status", type: "Single select", description: "Draft, In Progress, Complete" },
        { name: "Created Date", type: "Date", description: "When plan was created" },
        { name: "Last Modified", type: "Date", description: "Last update timestamp" }
      ]
    },
    {
      name: "Business Plan Sections",
      description: "Individual sections within each business plan",
      fields: [
        { name: "Section ID", type: "Single line text", description: "Unique section identifier" },
        { name: "Plan ID", type: "Single line text", description: "Links to Business Plans table" },
        { name: "Section Name", type: "Single line text", description: "Section title" },
        { name: "Content", type: "Long text", description: "Section content" },
        { name: "Is Complete", type: "Checkbox", description: "Completion status" },
        { name: "Completed By", type: "Single line text", description: "User who completed" },
        { name: "Completed At", type: "Date", description: "Completion timestamp" }
      ]
    },
    {
      name: "Users",
      description: "User management and permissions",
      fields: [
        { name: "User ID", type: "Single line text", description: "Unique user identifier" },
        { name: "Email", type: "Email", description: "User email address" },
        { name: "Name", type: "Single line text", description: "Full name" },
        { name: "Role", type: "Single select", description: "Admin, Editor, Viewer" },
        { name: "Last Active", type: "Date", description: "Last login date" }
      ]
    }
  ]

  const handleTestConnection = async () => {
    setIsConnecting(true)
    
    // Simulate API connection test
    setTimeout(() => {
      if (apiKey && baseId) {
        setConnectionStatus('success')
      } else {
        setConnectionStatus('error')
      }
      setIsConnecting(false)
    }, 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Database className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Airtable Setup Guide</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect your Airtable account to unlock advanced data management, analytics, and collaboration features.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">Setup Progress</span>
              <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            {steps.map((step, index) => (
              <Card 
                key={step.id}
                className={`cursor-pointer transition-all duration-200 ${
                  index === currentStep 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : index < currentStep 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'hover:bg-muted/50'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    index === currentStep 
                      ? 'bg-blue-500 text-white' 
                      : index < currentStep 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {index < currentStep ? <CheckCircle className="w-6 h-6" /> : step.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {steps[currentStep].icon}
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 0 && (
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      If you already have an Airtable account, you can skip this step and proceed to generate your API key.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Create Your Free Airtable Account</h4>
                    <ol className="space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <p>Visit <strong>airtable.com</strong> and click "Sign up for free"</p>
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <Link href="https://airtable.com/signup" target="_blank">
                              Go to Airtable <ExternalLink className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <p>Enter your email address and create a secure password</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <p>Verify your email address by clicking the link in your inbox</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <p>Complete the onboarding questionnaire (you can skip this if needed)</p>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Why Airtable?</h5>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Powerful database capabilities with spreadsheet simplicity</li>
                      <li>• Advanced filtering, sorting, and view options</li>
                      <li>• Robust API for seamless integration</li>
                      <li>• Collaboration features for team management</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Generate Your Personal API Key</h4>
                    <ol className="space-y-4 text-sm">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <p>Log into your Airtable account and click on your profile picture in the top right</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          <p>Select "Account" from the dropdown menu</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <div>
                          <p>Navigate to the "API" section in the left sidebar</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <div>
                          <p>Click "Generate API key" and copy the generated key</p>
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <Link href="https://airtable.com/account" target="_blank">
                              Go to Account Settings <ExternalLink className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="api-key">Enter Your Personal API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="api-key"
                          type={showApiKey ? "text" : "password"}
                          placeholder="key1234567890abcdef..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Keep your API key secure!</strong> Never share it publicly or commit it to version control. 
                      We'll store it securely in your environment variables.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Create Your Business Planning Base</h4>
                    <p className="text-sm text-muted-foreground">
                      We'll help you set up the required table structure for optimal integration with Impact Charter.
                    </p>
                  </div>

                  <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="manual">Manual Setup</TabsTrigger>
                      <TabsTrigger value="template">Use Template</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="manual" className="space-y-6">
                      <div className="space-y-4">
                        <h5 className="font-semibold">Step-by-Step Base Creation</h5>
                        <ol className="space-y-3 text-sm">
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                            <div>
                              <p>Go to your Airtable workspace and click "Create a base"</p>
                              <Button variant="outline" size="sm" className="mt-2" asChild>
                                <Link href="https://airtable.com" target="_blank">
                                  Open Airtable <ExternalLink className="w-3 h-3 ml-1" />
                                </Link>
                              </Button>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            <p>Name your base "Business Planning" or similar</p>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                            <p>Create the required tables with the structures shown below</p>
                          </li>
                        </ol>
                      </div>

                      <div className="space-y-4">
                        <h5 className="font-semibold">Required Table Structures</h5>
                        {tableStructures.map((table, index) => (
                          <Card key={index} className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">{table.name}</CardTitle>
                              <CardDescription>{table.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {table.fields.map((field, fieldIndex) => (
                                  <div key={fieldIndex} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                    <div>
                                      <span className="font-medium text-sm">{field.name}</span>
                                      <p className="text-xs text-muted-foreground">{field.description}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {field.type}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="template" className="space-y-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h5 className="font-semibold">Quick Setup with Template</h5>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Use our pre-configured Airtable template to get started instantly with all required tables and fields.
                        </p>
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600" asChild>
                          <Link href="https://airtable.com/universe/expXXXXXXXXXXXXXX/business-planning-template" target="_blank">
                            Copy Template to Your Workspace
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          This will create a new base in your workspace with all required tables pre-configured.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="space-y-3">
                    <Label htmlFor="base-id">Base ID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="base-id"
                        placeholder="appXXXXXXXXXXXXXX"
                        value={baseId}
                        onChange={(e) => setBaseId(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(baseId)}
                        disabled={!baseId}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Find your Base ID in the URL when viewing your base: airtable.com/appXXXXXXXXXXXXXX/...
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Connect Your Airtable Base</h4>
                    <p className="text-sm text-muted-foreground">
                      Test your connection and save your credentials securely.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Key className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-mono">
                          {apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'Not provided'}
                        </span>
                        {apiKey && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Base ID</Label>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Database className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-mono">
                          {baseId || 'Not provided'}
                        </span>
                        {baseId && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleTestConnection}
                      disabled={!apiKey || !baseId || isConnecting}
                      className="flex-1"
                    >
                      {isConnecting ? 'Testing Connection...' : 'Test Connection'}
                    </Button>
                  </div>

                  {connectionStatus === 'success' && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        <strong>Connection successful!</strong> Your Airtable base is properly configured and ready to use.
                      </AlertDescription>
                    </Alert>
                  )}

                  {connectionStatus === 'error' && (
                    <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        <strong>Connection failed.</strong> Please check your API key and Base ID, then try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {connectionStatus === 'success' && (
                    <div className="space-y-4">
                      <h5 className="font-semibold">Next Steps</h5>
                      <div className="grid gap-3">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Database className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h6 className="font-medium">Start Creating Business Plans</h6>
                                <p className="text-sm text-muted-foreground">Your data will now sync automatically with Airtable</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Settings className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h6 className="font-medium">Configure Advanced Features</h6>
                                <p className="text-sm text-muted-foreground">Set up custom views and automation in Airtable</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600"
                  asChild
                >
                  <Link href="/plans">
                    Start Building Plans
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
