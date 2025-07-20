import { Liveblocks } from "@liveblocks/node"

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY || "sk_dev_placeholder",
})

export async function POST(request: Request) {
  // In a real app, you'd authenticate the user here
  const user = {
    id: "user-1",
    info: {
      name: "Demo User",
      email: "user@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
    },
  }

  const session = liveblocks.prepareSession(user.id, {
    userInfo: user.info,
  })

  // Give access to all rooms for demo purposes
  session.allow("*", session.FULL_ACCESS)

  const { status, body } = await session.authorize()
  return new Response(body, { status })
}
