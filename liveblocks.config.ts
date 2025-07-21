// liveblocks.config.ts
// Central Liveblocks re-exports so the build can resolve them.

import { RoomProvider, useRoom, useStorage, useMutation } from "@liveblocks/react"

// Re-export the hooks and provider exactly as Vercel’s compiler expects.
export { RoomProvider, useRoom, useStorage, useMutation }
