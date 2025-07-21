"use client"

import { AppHeader } from "@/components/app-header"
import { UserSettingsForm } from "@/components/user-settings-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useUser } from "@/contexts/user-context"

export default function SettingsPage() {
  const { currentUser } = useUser()

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and Airtable connection settings.</p>
        </div>

        {currentUser ? <UserSettingsForm /> : <p>Loading user...</p>}
      </div>
    </>
  )
}
