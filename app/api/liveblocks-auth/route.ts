import { Liveblocks } from "@liveblocks/node"

/**
 * This Route Handler MUST run on Node.js (the Liveblocks SDK uses node:crypto).
 */
export const runtime = "nodejs"

export async function POST() {
  const secretKey = process.env.LIVEBLOCKS_SECRET_KEY

  // ⛔️ Missing or wrong secret key → return 500 with a helpful message
  if (!secretKey || secretKey.startsWith("sk_dev_placeholder")) {
    console.error("Liveblocks secret key is missing or invalid")
    return new Response(
      JSON.stringify({
        error: "LIVEBLOCKS_SECRET_KEY is missing or invalid",
        message: "Add your real secret key in Vercel → Project → Settings → Environment Variables",
        docs: "https://liveblocks.io/docs/get-started/nextjs",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }

  try {
    const liveblocks = new Liveblocks({ secret: secretKey })

    // TODO: replace this with real authentication logic
    const user = {
      id: "user-1",
      info: {
        name: "Demo User",
        email: "user@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
      },
    }

    const session = liveblocks.prepareSession(user.id, { userInfo: user.info })
    session.allow("*", session.FULL_ACCESS)

    const { status, body } = await session.authorize()
    return new Response(body, { status })
  } catch (err) {
    console.error("Liveblocks auth error:", err)
    return new Response(
      JSON.stringify({
        error: "Internal Liveblocks Auth Error",
        message: "See the logs for details.",
        details: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

// Add a GET method for health check
export async function GET() {
  const secretKey = process.env.LIVEBLOCKS_SECRET_KEY

  return new Response(
    JSON.stringify({
      status: "ok",
      configured: !!secretKey && !secretKey.startsWith("sk_dev_placeholder"),
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  )
}
