"use client"

import { useState, useCallback, useEffect } from "react"
import { useUser } from "@/contexts/user-context"
import { getUserSettings } from "@/lib/user-settings"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, RefreshCw, Server, Table, TestTube } from "lucide-react"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import type { AirtableConnection, AirtableTable, AirtableTestResult } from "@/lib/airtable-debug"

export function AirtableAdmin() {
  const { currentUser } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [connection, setConnection] = useState<AirtableConnection | null>(null)
  const [tables, setTables] = useState<AirtableTable[]>([])
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<AirtableTestResult | null>(null)
  const [testTableName, setTestTableName] = useState("")

  const fetchData = useCallback(async () => {
    if (!currentUser) return
    setIsLoading(true)

    const settings = getUserSettings(currentUser.email)

    // Fetch connection status
    const connRes = await fetch("/api/admin/airtable/connection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        airtableApiKey: settings.airtableApiKey,
        airtableBaseId: settings.airtableBaseId,
      }),
    })
    const connData = await connRes.json()
    setConnection(connData)

    if (connData.isConnected) {
      // Fetch tables if connected
      const tablesRes = await fetch("/api/admin/airtable/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          airtableApiKey: settings.airtableApiKey,
          airtableBaseId: settings.airtableBaseId,
        }),
      })
      const tablesData = await tablesRes.json()
      setTables(tablesData.tables || [])
    }

    setIsLoading(false)
  }, [currentUser])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTestQuery = async () => {
    if (!currentUser || !testTableName) return
    setIsTesting(true)
    setTestResult(null)

    const settings = getUserSettings(currentUser.email)

    const res = await fetch("/api/admin/airtable/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        airtableApiKey: settings.airtableApiKey,
        airtableBaseId: settings.airtableBaseId,
        tableName: testTableName,
        options: { maxRecords: 3 },
      }),
    })
    const resultData = await res.json()
    setTestResult(resultData)
    setIsTesting(false)
  }

  const renderConnectionStatus = () => {
    if (isLoading)
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin w-4 h-4" />
          <span>Checking connection...</span>
        </div>
      )
    if (!connection) return <p>Could not fetch connection status.</p>

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {connection.isConnected ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <p className="font-semibold">{connection.isConnected ? "Connected" : "Disconnected"}</p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">API Key:</p>
            {connection.hasApiKey ? (
              <Badge variant="default" className="bg-blue-500">
                Configured
              </Badge>
            ) : (
              <Badge variant="destructive">Missing</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Base ID:</p>
            {connection.baseId ? (
              <Badge variant="secondary">{connection.baseId}</Badge>
            ) : (
              <Badge variant="destructive">Not set</Badge>
            )}
          </div>
        </div>
        {connection.error && (
          <Alert variant="destructive">
            <AlertDescription>{connection.error}</AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Connection Status
            </CardTitle>
            <CardDescription>Live status of the Airtable API connection.</CardDescription>
          </div>
          <Button onClick={fetchData} variant="outline" size="icon" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>{renderConnectionStatus()}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="w-5 h-5" />
            Detected Tables
          </CardTitle>
          <CardDescription>Tables found in the configured Airtable base.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading tables...</p>
          ) : connection?.isConnected && tables.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tables.map((table) => (
                <Badge key={table.id} variant="outline">
                  {table.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No tables found or not connected.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            API Query Tester
          </CardTitle>
          <CardDescription>Run a simple test query against a table.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-grow space-y-1">
              <Label htmlFor="table-name">Table Name</Label>
              <Input
                id="table-name"
                placeholder="e.g., Business Plans"
                value={testTableName}
                onChange={(e) => setTestTableName(e.target.value)}
                disabled={!connection?.isConnected}
              />
            </div>
            <Button
              onClick={handleTestQuery}
              disabled={isTesting || !connection?.isConnected || !testTableName}
              className="self-end"
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run Test"}
            </Button>
          </div>
          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <AlertDescription>
                <p className="font-semibold">
                  Result: {testResult.success ? "Success" : "Failed"} (Status: {testResult.status}, Time:{" "}
                  {testResult.responseTime}ms)
                </p>
                <pre className="mt-2 text-xs bg-muted p-2 rounded-md overflow-x-auto">
                  {JSON.stringify(testResult.data || { error: testResult.error }, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
