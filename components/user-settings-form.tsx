"use client"

import { Button } from "@/components/ui/button"

/**
 * Temporary stub so the build can resolve <UserSettingsForm />.
 * Replace with the real settings UI once your Supabase preferences
 * flow is in place.
 */
export function UserSettingsForm() {
  async function onSubmit(formData: FormData) {
    /* noop – implement real save later */
    console.info("UserSettingsForm submitted", Object.fromEntries(formData))
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="displayName" className="text-sm font-medium">
          Display&nbsp;name
        </label>
        <input
          id="displayName"
          name="displayName"
          className="border rounded px-3 py-2"
          placeholder="Jane Doe"
          required
        />
      </div>

      <Button type="submit">Save</Button>
    </form>
  )
}
