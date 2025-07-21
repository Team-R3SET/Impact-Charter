"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CreatePlanDialog } from "@/components/create-plan-dialog"
import { FileText, Plus, Sparkles, BookOpen, Target, TrendingUp, Users, Lightbulb } from "lucide-react"

interface PlansEmptyStateProps {
  hasSearchQuery?: boolean
  searchQuery?: string
}

export function PlansEmptyState({ hasSearchQuery, searchQuery }: PlansEmptyStateProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  if (hasSearchQuery) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No plans found</h3>
        <p className="text-muted-foreground mb-4">
          No business plans match "{searchQuery}". Try adjusting your search terms or filters.
        </p>
        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
          Clear Search
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="text-center py-12 max-w-2xl mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-blue-500" />
        </div>

        <h3 className="text-2xl font-bold mb-3">Welcome to Business Planning!</h3>
        <p className="text-muted-foreground mb-8 text-lg">
          Create your first business plan to start building your vision into reality. Our collaborative platform makes
          it easy to organize your ideas and work with your team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 border-dashed">
            <CardContent className="p-0 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-1">Define Your Vision</h4>
              <p className="text-sm text-muted-foreground">Outline your business goals and strategy</p>
            </CardContent>
          </Card>

          <Card className="p-4 border-dashed">
            <CardContent className="p-0 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-1">Collaborate</h4>
              <p className="text-sm text-muted-foreground">Work together with your team in real-time</p>
            </CardContent>
          </Card>

          <Card className="p-4 border-dashed">
            <CardContent className="p-0 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold mb-1">Track Progress</h4>
              <p className="text-sm text-muted-foreground">Monitor your plan's development and completion</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Plan
          </Button>
          <Button variant="outline" size="lg">
            <BookOpen className="w-5 h-5 mr-2" />
            Browse Templates
          </Button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Pro Tip</span>
          </div>
          <p className="text-sm text-blue-800">
            Start with a template to save time, or create a blank plan for complete customization. You can always modify
            sections later as your business evolves.
          </p>
        </div>
      </div>

      <CreatePlanDialog isOpen={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
    </>
  )
}
