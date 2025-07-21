/**
 * liveblocks.config.ts
 *
 * Central Liveblocks configuration.
 * Creates a client, a typed Room context, and re-exports the four symbols
 * the rest of the codebase (and the Vercel build) expect.
 *
 * If you need more Liveblocks hooks, simply add them to the export list at
 * the bottom. The generic parameters give you full type-safety for presence,
 * shared storage, user metadata and custom events.
 */

import { createClient, type LiveList, type LiveObject } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"
import type { UserProfile } from "@/lib/types"

/* -------------------------------------------------------------------------- */
/* Liveblocks client                                                          */
/* -------------------------------------------------------------------------- */

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
})

/* -------------------------------------------------------------------------- */
/* Strongly-typed room setup (customise as your app evolves)                  */
/* -------------------------------------------------------------------------- */

// Information each connected user shares in real-time
type Presence = {
  cursor: { x: number; y: number } | null
}

// Document-level shared state (persisted by Liveblocks)
type Storage = {
  // Example: a list of business-plan sections edited collaboratively
  // You can delete/replace this when wiring up actual storage objects.
  sections: LiveList<LiveObject<{ id: string; title: string; content: string }>>
}

// Extra static metadata returned from your auth endpoint
type UserMeta = {
  id: string
  info?: UserProfile
}

// Shape of custom broadcast events (unused for now)
type RoomEvent = never

// createRoomContext returns every React hook you need.
// We only export the four that the build currently requires, but you’re free
// to re-export more.
export const { RoomProvider, useRoom, useStorage, useMutation } = createRoomContext<
  Presence,
  Storage,
  UserMeta,
  RoomEvent
>(client)
