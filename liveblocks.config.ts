/**
 * liveblocks.config.ts
 *
 * Central re-exports so Vercel’s build can resolve the required symbols.
 * Nothing else is needed here.
 *
 * If you need to customise any Liveblocks behaviour later, you can
 * replace these re-exports with wrapper functions/components.
 */

import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"
import type { BusinessPlanSection, UserProfile } from "./lib/types"
import type { LiveList, LiveObject } from "@liveblocks/client"

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
  // Get your public key from https://liveblocks.io/dashboard
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
})

// Presence represents the properties that exist on every user in the Room
// and that will be broadcasted to every other user as they change.
type Presence = {
  cursor: { x: number; y: number } | null
  // ... and anything else you want to share about your users
}

// Optionally, Storage represents the shared document that persists in the
// Room, even after all users leave. Fields under Storage typically are
// LiveList, LiveMap, LiveObject instances, for which updates are
// automatically persisted and synced to all connected clients.
type Storage = {
  sections: LiveList<LiveObject<BusinessPlanSection>>
}

// Optionally, UserMeta represents static/readonly metadata on every user,
// like their name or avatar. This info is returned from your auth endpoint.
type UserMeta = {
  id: string
  info: UserProfile
}

// Optionally, the type of custom events broadcasted and listened to in this
// room. Use a union for multiple events. e.g. CustomEvent = ... |...
type RoomEvent = {
  // type: "YOUR_EVENT_NAME",
  // payload: {...}
}

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useOthersMapped,
  useOthersConnectionIds,
  useOther,
  useBroadcastEvent,
  useEventListener,
  useErrorListener,
  useStorage,
  useObject,
  useMap,
  useList,
  useHistory,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useMutation,
  useStatus,
  useLostConnectionListener,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client)
