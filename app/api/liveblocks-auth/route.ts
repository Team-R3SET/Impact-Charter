import { Liveblocks } from "@liveblocks/node"
import { createClient } from "@/lib/supabase/server"

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
})

export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: profile?.name ?? user.email,
      avatar: profile?.avatar_url,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
    },
  })

  const { room } = await request.json()
  session.allow(room, session.FULL_ACCESS)

  const { status, body } = await session.authorize()
  return new Response(body, { status })
}
