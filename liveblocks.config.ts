/**
 * liveblocks.config.ts
 *
 * Central re-exports so Vercel’s build can resolve the required symbols.
 * Nothing else is needed here.
 *
 * If you need to customise any Liveblocks behaviour later, you can
 * replace these re-exports with wrapper functions/components.
 */

export {
  RoomProvider,
  useRoom,
  useStorage,
  useMutation,
} from "@liveblocks/react"
