import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { UserProfileForm } from "@/components/user-profile-form"
import { getUserProfile } from "@/lib/supabase/queries"

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getUserProfile(user.id)

  return (
    <div>
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <UserProfileForm profile={profile} />
      </main>
    </div>
  )
}
