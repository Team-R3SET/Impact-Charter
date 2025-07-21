/**
 * liveblocks.config.ts
 *
 * This file re-exports the Liveblocks hooks and provider exactly the way
 * Vercel’s compiler expects.  Nothing else is required here.
 */
export {
  RoomProvider,
  useRoom,
  useStorage,
  useMutation,
} from "@liveblocks/react"
