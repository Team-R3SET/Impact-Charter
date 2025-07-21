"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Plus } from "lucide-react"

interface PlansEmptyStateProps {
  onCreatePlan: () => void
}

export function PlansEmptyState({ onCreatePlan }: PlansEmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No business plans yet</h3>
          <p className="text-muted-foreground mb-6">
            Get started by creating your first business plan. You can choose from templates or start from scratch.
          </p>
          <Button onClick={onCreatePlan} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
