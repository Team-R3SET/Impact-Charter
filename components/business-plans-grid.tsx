"use client"

import { useState } from "react"
import { PlanCard } from "./plan-card"
import { PlansEmptyState } from "./plans-empty-state"
import { RenamePlanDialog } from "./rename-plan-dialog"
import { useToast } from "@/hooks/use-toast"
import type { BusinessPlan } from "@/lib/airtable"

interface BusinessPlansGridProps {
  plans: BusinessPlan[]
  viewMode: "grid" | "list"
  onCreatePlan: () => void
  onRefresh: () => void
}

export function BusinessPlansGrid({ plans, viewMode, onCreatePlan, onRefresh }: BusinessPlansGridProps) {
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; planId: string; currentName: string }>({
    open: false,
    planId: "",
    currentName: "",
  })
  const { toast } = useToast()

  const handleRename = (planId: string, currentName: string) => {
    setRenameDialog({ open: true, planId, currentName })
  }

  const handleRenameConfirm = async (newName: string) => {
    try {
      const response = await fetch(`/api/business-plans/${renameDialog.planId}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: newName }),
      })

      if (response.ok) {
        toast({
          title: "Plan renamed",
          description: `Plan has been renamed to "${newName}".`,
        })
        onRefresh()
      } else {
        throw new Error("Failed to rename plan")
      }
    } catch (error) {
      toast({
        title: "Failed to rename",
        description: "There was an error renaming the plan.",
        variant: "destructive",
      })
    } finally {
      setRenameDialog({ open: false, planId: "", currentName: "" })
    }
  }

  const handleDelete = async (planId: string) => {
    try {
      const response = await fetch(`/api/business-plans/${planId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onRefresh()
      } else {
        throw new Error("Failed to delete plan")
      }
    } catch (error) {
      throw error // Re-throw to be handled by PlanCard
    }
  }

  if (plans.length === 0) {
    return <PlansEmptyState onCreatePlan={onCreatePlan} />
  }

  return (
    <>
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} viewMode={viewMode} onRename={handleRename} onDelete={handleDelete} />
        ))}
      </div>

      <RenamePlanDialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog({ ...renameDialog, open })}
        currentName={renameDialog.currentName}
        onConfirm={handleRenameConfirm}
      />
    </>
  )
}
