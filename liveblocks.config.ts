import { createRoomContext } from "@liveblocks/react"
import type { LiveList, LiveObject } from "@liveblocks/client"
import type { BusinessPlanSection } from "@/lib/types"

/**
 * Presence: what each user broadcasts to others.
 * Extend as you add richer presence info (e.g. name, avatar, cursor).
 */
type Presence = {
  cursor: { x: number; y: number } | null
}

/**
 * Storage: collaborative data that lives in the room.
 * Adapt this to match your real-time schema.
 */
type Storage = {
  sections: LiveList<LiveObject<BusinessPlanSection>>
  completedSections: LiveObject<Record<string, boolean>>
}

/**
 *   RoomProvider    – React provider that wraps your component tree
 *   useRoom         – Hook for low-level room access (connection status, users, etc.)
 *   useStorage      – Hook to read Liveblocks storage in real time
 *   useMutation     – Helper to mutate storage inside a callback
 */
const { RoomProvider, useRoom, useStorage, useMutation } = createRoomContext<Presence, Storage>()

export { RoomProvider, useRoom, useStorage, useMutation }
