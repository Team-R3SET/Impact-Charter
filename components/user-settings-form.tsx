"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export interface UserSettingsFormProps {
  initialEmail?: string
  initialName?: string
}

export function UserSettingsForm({ initialEmail = "", initialName = "" }: UserSettingsFormProps) {
  const { toast } = useToast()
  const [email, setEmail] = useState(initialEmail)
  const [name, setName] = useState(initialName)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setEmail(initialEmail)
    setName(initialName)
  }, [initialEmail, initialName])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Call your server action or REST endpoint here.
    await new Promise((r) => setTimeout(r, 750))

    toast({
      title: "Profile updated",
      description: "Your settings have been saved.",
    })
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full mx-auto" aria-describedby="user-settings-form">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  )
}
