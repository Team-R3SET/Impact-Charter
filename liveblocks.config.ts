import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"
import type { UserProfile } from "./lib/types"
import type { LiveList, LiveObject } from "@liveblocks/client"
import type { BusinessPlanSection } from "./lib/types"

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
})

// Presence represents the properties that exist on every user in the Room
// and that will be broadcasted to every other user as they change.
type Presence = {
  cursor: { x: number; y: number } | null
}

// The Storage is the document-level data that is persisted by Liveblocks.
type Storage = {
  sections: LiveList<LiveObject<BusinessPlanSection>>
}

// UserMeta represents static/readonly metadata on every user.
type UserMeta = {
  id: string // Accessible through `user.id`
  info: UserProfile // Accessible through `user.info`
}

type RoomEvent = {}

// Export the hooks and provider that will be used in your app
export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useOthersMapped,
  useStorage,
  useMutation,
  useHistory,
  useUndo,
  useRedo,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client)
