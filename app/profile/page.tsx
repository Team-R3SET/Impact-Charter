import { getUserProfile } from "@/lib/airtable"
import { UserProfileForm } from "@/components/user-profile-form"
import { AppHeader } from "@/components/app-header"

export default async function ProfilePage() {
  // TODO: Replace with real auth
  const userEmail = "user@example.com"
  const currentUser = {
    name: "Demo User",
    email: userEmail,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
  }

  const profile = await getUserProfile(userEmail)

  return (
    <>
      <AppHeader currentUser={currentUser} />
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences.</p>
        </div>

        <UserProfileForm initialProfile={profile} userEmail={userEmail} />
      </div>
    </>
  )
}

export const metadata = {
  title: "Profile - Business Plan Builder",
  description: "Manage your user profile and preferences",
}
