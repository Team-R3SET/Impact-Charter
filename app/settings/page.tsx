import { UserSettingsForm } from "@/components/user-settings-form"
import { AppHeader } from "@/components/app-header"

export default function SettingsPage() {
  // TODO: Replace with real auth
  const userEmail = "user@example.com"
  const currentUser = {
    name: "Demo User",
    email: userEmail,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
  }

  return (
    <>
      <AppHeader currentUser={currentUser} />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and integrations</p>
        </div>

        <UserSettingsForm userEmail={userEmail} />
      </div>
    </>
  )
}

export const metadata = {
  title: "Settings - Business Plan Builder",
  description: "Manage your account settings and integrations",
}
