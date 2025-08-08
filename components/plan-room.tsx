"use client"

import type { ReactNode } from "react"
import { RoomProvider } from "@/lib/liveblocks"
import { LiveblocksProvider } from "@liveblocks/react"

interface PlanRoomProps {
  roomId: string
  userName: string
  userEmail: string
  children: ReactNode
}

export function PlanRoom({ roomId, userName, userEmail, children }: PlanRoomProps) {
  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      throttle={16}
    >
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          selectedSection: null,
          textCursor: null,
          textSelection: null,
          isTyping: null,
          user: {
            name: userName,
            email: userEmail,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`,
          },
        }}
        initialStorage={{
          sections: {},
          completedSections: {},
        }}
      >
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  )
}
