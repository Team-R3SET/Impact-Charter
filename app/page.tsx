"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createBusinessPlan } from "@/lib/airtable"
import { PlusCircle, FileText } from "lucide-react"

export default function HomePage() {
  const [planName, setPlanName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleCreatePlan = async () => {
    if (!planName.trim()) return

    setIsCreating(true)
    try {
      const plan = await createBusinessPlan({
        planName: planName.trim(),
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        ownerEmail: "user@example.com", // In a real app, get from auth
        status: "Draft",
      })

      if (plan.id) {
        router.push(`/plan/${plan.id}`)
      }
    } catch (error) {
      console.error("Failed to create business plan:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Plan Builder</h1>
          <p className="text-gray-600">Create and collaborate on business plans in real-time</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Create New Business Plan
            </CardTitle>
            <CardDescription>Start building your business plan with collaborative editing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Enter your business plan name..."
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreatePlan()}
              />
            </div>
            <Button onClick={handleCreatePlan} disabled={!planName.trim() || isCreating} className="w-full">
              {isCreating ? "Creating..." : "Create Business Plan"}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>✨ Features included:</p>
          <ul className="mt-2 space-y-1">
            <li>• Real-time collaborative editing</li>
            <li>• Auto-save to Airtable database</li>
            <li>• Section-by-section organization</li>
            <li>• Live presence indicators</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
