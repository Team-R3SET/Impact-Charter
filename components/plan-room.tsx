"use client"

import type { ReactNode } from "react"
import { RoomProvider } from "@/lib/liveblocks"

interface PlanRoomProps {
  roomId: string
  userName: string
  userEmail: string
  children: ReactNode
}

export function PlanRoom({ roomId, userName, userEmail, children }: PlanRoomProps) {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        selectedSection: null,
        user: {
          name: userName,
          email: userEmail,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`,
        },
      }}
      initialStorage={{ sections: {} }}
    >
      {children}
    </RoomProvider>
  )
}
