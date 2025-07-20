export interface UserSettings {
  id?: string
  userEmail: string
  airtableApiKey?: string
  airtableBaseId?: string
  isAirtableConnected: boolean
  createdDate: string
  lastModified: string
}

export interface AirtableConnectionTest {
  success: boolean
  message: string
  baseInfo?: {
    name: string
    tables: string[]
  }
}
