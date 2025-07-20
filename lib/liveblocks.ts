import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

// The client fetches a token from our API route; no keys are exposed in the bundle
const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
})

type Presence = {
  cursor: { x: number; y: number } | null
  selectedSection: string | null
  user: {
    name: string
    email: string
    avatar: string
  }
}

type Storage = {
  sections: Record<
    string,
    {
      title: string
      content: string
      lastModified: string
      modifiedBy: string
      isCompleted?: boolean
    }
  >
  completedSections: Record<string, boolean>
}

type UserMeta = {
  id: string
  info: {
    name: string
    email: string
    avatar: string
  }
}

type RoomEvent = {}

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useOthers,
  useMutation,
  useStorage,
  useObject,
  useBroadcastEvent,
  useEventListener,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client)
