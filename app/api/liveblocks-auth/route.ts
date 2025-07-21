import { Liveblocks } from "@liveblocks/node"
import type { NextRequest } from "next/server"
import { config, isServiceEnabled } from "@/lib/config"
import { createClient } from "@/lib/supabase/server"

const liveblocks = new Liveblocks({
  secret: config.liveblocks.secretKey || "sk_dev_placeholder_key_for_development",
})

export async function POST(request: NextRequest) {
  try {
    // Check if Liveblocks is properly configured
    if (!isServiceEnabled("liveblocks")) {
      console.warn("Liveblocks is not properly configured, using fallback mode")
      return new Response(
        JSON.stringify({
          error: "Liveblocks not configured",
          fallback: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const { room: roomId } = await request.json()

    if (!roomId) {
      return new Response(JSON.stringify({ error: "Room ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get user from session or use demo user
    let userId = "demo-user"
    let userInfo = {
      name: "Demo User",
      email: "demo@example.com",
      avatar: "/placeholder-user.jpg",
    }

    // If Supabase is configured, try to get real user
    if (isServiceEnabled("supabase")) {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          userId = user.id
          userInfo = {
            name: user.user_metadata?.full_name || user.email || "User",
            email: user.email || "user@example.com",
            avatar: user.user_metadata?.avatar_url || "/placeholder-user.jpg",
          }

          // Check if user has access to this room
          const { data: planAccess } = await supabase
            .from("business_plans")
            .select("id")
            .eq("id", roomId)
            .eq("user_id", user.id)
            .single()

          if (!planAccess) {
            return new Response(JSON.stringify({ error: "Access denied" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            })
          }
        }
      } catch (error) {
        console.warn("Failed to authenticate with Supabase, using demo user:", error)
      }
    }

    // Create Liveblocks session
    const session = liveblocks.prepareSession(userId, {
      userInfo,
    })

    // Give access to the specific room
    session.allow(roomId, session.FULL_ACCESS)

    const { status, body } = await session.authorize()

    return new Response(body, {
      status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Liveblocks auth error:", error)

    // Return a fallback response that allows the app to continue working
    return new Response(
      JSON.stringify({
        error: "Authentication failed",
        fallback: true,
        message: "Using offline mode",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
