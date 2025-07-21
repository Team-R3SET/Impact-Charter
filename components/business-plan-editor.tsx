"use client"
// Remove the old imports
// import { useStorage, useMutation } from "@/lib/liveblocks";

// Add the new imports using the alias
import { useStorage, useMutation } from "liveblocks.config"

const BusinessPlanEditor = () => {
  // Example usage of Liveblocks hooks
  const data = useStorage((root) => root.data)
  const updateData = useMutation(({ storage }, newData) => {
    storage.root.set("data", newData)
  }, [])

  return (
    <div>
      <h1>Business Plan Editor</h1>
      <p>Data from Liveblocks: {JSON.stringify(data)}</p>
      <button onClick={() => updateData({ newData: { example: "updated" } })}>Update Data</button>
    </div>
  )
}

export default BusinessPlanEditor
