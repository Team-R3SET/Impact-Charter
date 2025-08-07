"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, ArrowRight, ArrowLeft, BookOpen, Users, Database, Settings, ExternalLink, Eye, EyeOff } from 'lucide-react'
import Link from "next/link"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showApiKey, setShowApiKey] = useState(false)

  const steps = [
    {
      title: "Welcome to Impact Charter",
      description: "Let's get you set up in just a few minutes",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Ready to build your business plan?</h3>
            <p className="text-muted-foreground mb-6">
              We'll guide you through everything you need to know to get started with our platform.
            </p>
          </div>
          
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm">Choose from 50+ professional templates</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Collaborate with your team in real-time</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span className="text-sm">Get AI-powered insights and suggestions</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How the Platform Works",
      description: "Understanding the core features",
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Business Plan Editor</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Use our structured editor to create comprehensive business plans with guided sections and AI assistance.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Team Collaboration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Invite team members to collaborate in real-time with comments, suggestions, and live editing.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Database className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Data Integration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with Airtable for advanced data management, analytics, and automated reporting.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Setting Up Airtable (Optional)",
      description: "Enhanced features with data integration",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Why Connect Airtable?</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Advanced data management and organization</li>
              <li>• Automated progress tracking and analytics</li>
              <li>• Custom fields and data relationships</li>
              <li>• Enhanced reporting capabilities</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
              <div>
                <h5 className="font-medium">Create an Airtable Account</h5>
                <p className="text-sm text-muted-foreground">Sign up at airtable.com if you don't have an account</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="https://airtable.com/signup" target="_blank">
                    Go to Airtable <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
              <div>
                <h5 className="font-medium">Get Your API Key</h5>
                <p className="text-sm text-muted-foreground mb-2">Go to Account → API → Generate API key</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono">
                  <div className="flex items-center justify-between">
                    <span className={showApiKey ? "" : "blur-sm select-none"}>
                      key1234567890abcdef...
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
              <div>
                <h5 className="font-medium">Follow Our Setup Guide</h5>
                <p className="text-sm text-muted-foreground mb-2">We'll help you set up the required tables automatically</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/setup/airtable" target="_blank">
                    Open Setup Guide <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Don't worry!</strong> You can skip this step and use our demo mode. You can always connect Airtable later from your settings.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set!",
      description: "Ready to create your first business plan",
      content: (
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-2">Welcome aboard!</h3>
            <p className="text-muted-foreground mb-6">
              You're ready to start building professional business plans. Here's what you can do next:
            </p>
          </div>

          <div className="grid gap-3">
            <Card className="text-left">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Browse Templates</h5>
                    <p className="text-sm text-muted-foreground">Choose from industry-specific templates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Settings className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Try the Demo</h5>
                    <p className="text-sm text-muted-foreground">Explore features with sample data</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h5 className="font-medium">Invite Your Team</h5>
                    <p className="text-sm text-muted-foreground">Collaborate with colleagues and advisors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGetStarted = () => {
    onClose()
    window.location.href = "/register"
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{steps[currentStep].title}</DialogTitle>
              <p className="text-muted-foreground mt-1">{steps[currentStep].description}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </DialogHeader>

        <div className="py-6">
          {steps[currentStep].content}
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep} className="flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleGetStarted} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
