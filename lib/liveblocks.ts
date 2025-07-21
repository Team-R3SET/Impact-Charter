import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

// The client fetches a token from our API route; no keys are exposed in the bundle
const client = createClient({
  // Use a function for dynamic auth endpoint
  authEndpoint: async (roomId) => {
    const response = await fetch(`/api/liveblocks-auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("Liveblocks auth failed:", errorBody)
      // Throw an error to notify Liveblocks client about the failure
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
    }

    // Liveblocks client expects a JSON response with a token
    return await response.json()
  },
})

type Presence = {
  cursor: { x: number; y: number } | null
  selectedSection: string | null
  textCursor: { sectionId: string; position: number } | null
  textSelection: { sectionId: string; start: number; end: number } | null
  isTyping: { sectionId: string; timestamp: number } | null
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

type RoomEvent = {
  type: "TEXT_CHANGE"
  sectionId: string
  content: string
  userId: string
}

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
