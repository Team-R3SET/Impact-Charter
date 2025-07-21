"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Database,
  Search,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Zap,
  AlertCircle,
  Info,
} from "lucide-react"
import type { AirtableTable, AirtableConnection, AirtableTestResult } from "@/lib/airtable-debug"

export function AirtableAdmin() {
  const [connection, setConnection] = useState<AirtableConnection | null>(null)
  const [tables, setTables] = useState<AirtableTable[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [testResults, setTestResults] = useState<AirtableTestResult[]>([])
  const [testLoading, setTestLoading] = useState(false)

  // Test form state
  const [testMethod, setTestMethod] = useState<"GET" | "POST" | "PATCH" | "DELETE">("GET")
  const [testFilter, setTestFilter] = useState("")
  const [testMaxRecords, setTestMaxRecords] = useState("10")
  const [testFields, setTestFields] = useState("")
  const [testData, setTestData] = useState("")
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchConnectionStatus()
    fetchTables()
  }, [])

  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch("/api/admin/airtable/connection")
      if (response.ok) {
        const data = await response.json()
        setConnection(data)
      }
    } catch (error) {
      console.error("Failed to fetch connection status:", error)
    }
  }

  const fetchTables = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/airtable/tables")
      if (response.ok) {
        const data = await response.json()
        setTables(data.tables || [])
      }
    } catch (error) {
      console.error("Failed to fetch tables:", error)
    } finally {
      setLoading(false)
    }
  }

  const runTest = async () => {
    if (!selectedTable) return

    setTestLoading(true)
    try {
      const testOptions: any = {
        method: testMethod,
      }

      if (testFilter) testOptions.filterFormula = testFilter
      if (testMaxRecords) testOptions.maxRecords = Number.parseInt(testMaxRecords)
      if (testFields) testOptions.fields = testFields.split(",").map((f) => f.trim())
      if (testData && (testMethod === "POST" || testMethod === "PATCH")) {
        testOptions.data = JSON.parse(testData)
      }

      const response = await fetch("/api/admin/airtable/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableName: selectedTable,
          options: testOptions,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setTestResults((prev) => [result, ...prev.slice(0, 9)]) // Keep last 10 results
      }
    } catch (error) {
      console.error("Test failed:", error)
    } finally {
      setTestLoading(false)
    }
  }

  const toggleTableExpansion = (tableId: string) => {
    const newExpanded = new Set(expandedTables)
    if (newExpanded.has(tableId)) {
      newExpanded.delete(tableId)
    } else {
      newExpanded.add(tableId)
    }
    setExpandedTables(newExpanded)
  }

  const filteredTables = tables.filter(
    (table) =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.fields.some(
        (field) =>
          field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.type.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  )

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getFieldTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      singleLineText: "bg-blue-100 text-blue-800",
      email: "bg-purple-100 text-purple-800",
      number: "bg-green-100 text-green-800",
      date: "bg-orange-100 text-orange-800",
      checkbox: "bg-gray-100 text-gray-800",
      singleSelect: "bg-yellow-100 text-yellow-800",
      multipleSelects: "bg-pink-100 text-pink-800",
      formula: "bg-indigo-100 text-indigo-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading Airtable configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Airtable Admin</h1>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connection ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(connection.isConnected)}
                <span className={connection.isConnected ? "text-green-600" : "text-red-600"}>
                  {connection.isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">API Key:</span>{" "}
                  <Badge variant={connection.hasApiKey ? "default" : "destructive"}>
                    {connection.hasApiKey ? "Configured" : "Missing"}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Base ID:</span>{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">{connection.baseId || "Not set"}</code>
                </div>
              </div>

              {connection.error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div className="text-sm text-red-700">{connection.error}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground">Loading connection status...</div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">Tables & Fields</TabsTrigger>
          <TabsTrigger value="test">API Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tables and fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Badge variant="outline">{filteredTables.length} tables</Badge>
          </div>

          {/* Tables List */}
          <div className="space-y-4">
            {filteredTables.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "No tables match your search" : "No tables found"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredTables.map((table) => (
                <Card key={table.id}>
                  <Collapsible open={expandedTables.has(table.id)} onOpenChange={() => toggleTableExpansion(table.id)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {expandedTables.has(table.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <CardTitle>{table.name}</CardTitle>
                            <Badge variant="outline">{table.fields.length} fields</Badge>
                          </div>
                        </div>
                        <CardDescription>
                          Primary field: {table.fields.find((f) => f.id === table.primaryFieldId)?.name || "Unknown"}
                        </CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Fields ({table.fields.length})</h4>
                            <div className="grid gap-2">
                              {table.fields.map((field) => (
                                <div key={field.id} className="flex items-center justify-between p-3 border rounded">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{field.name}</span>
                                      {field.id === table.primaryFieldId && (
                                        <Badge variant="default" className="text-xs">
                                          Primary
                                        </Badge>
                                      )}
                                    </div>
                                    {field.description && (
                                      <p className="text-sm text-muted-foreground">{field.description}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <Badge className={`text-xs ${getFieldTypeColor(field.type)}`}>{field.type}</Badge>
                                    {field.options && Object.keys(field.options).length > 0 && (
                                      <div className="text-xs text-muted-foreground mt-1">Has options</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {table.views.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Views ({table.views.length})</h4>
                              <div className="flex flex-wrap gap-2">
                                {table.views.map((view) => (
                                  <Badge key={view.id} variant="outline">
                                    {view.name} ({view.type})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  API Test Configuration
                </CardTitle>
                <CardDescription>Configure and run API calls to test your Airtable integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="table-select">Table</Label>
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select table" />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.map((table) => (
                          <SelectItem key={table.id} value={table.name}>
                            {table.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="method-select">Method</Label>
                    <Select value={testMethod} onValueChange={(value: any) => setTestMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="filter">Filter Formula (optional)</Label>
                  <Input
                    id="filter"
                    placeholder="e.g., {Status} = 'Active'"
                    value={testFilter}
                    onChange={(e) => setTestFilter(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-records">Max Records</Label>
                    <Input
                      id="max-records"
                      type="number"
                      placeholder="10"
                      value={testMaxRecords}
                      onChange={(e) => setTestMaxRecords(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fields">Fields (comma-separated)</Label>
                    <Input
                      id="fields"
                      placeholder="Name, Email, Status"
                      value={testFields}
                      onChange={(e) => setTestFields(e.target.value)}
                    />
                  </div>
                </div>

                {(testMethod === "POST" || testMethod === "PATCH") && (
                  <div>
                    <Label htmlFor="test-data">Request Data (JSON)</Label>
                    <Textarea
                      id="test-data"
                      placeholder='{"Name": "Test", "Email": "test@example.com"}'
                      value={testData}
                      onChange={(e) => setTestData(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}

                <Button onClick={runTest} disabled={!selectedTable || testLoading} className="w-full">
                  {testLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Running Test...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Test
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Test Results
                </CardTitle>
                <CardDescription>Recent API test results and responses</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {testResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Info className="h-8 w-8 mx-auto mb-2" />
                      <p>No test results yet</p>
                      <p className="text-sm">Run a test to see results here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {testResults.map((result, index) => (
                        <div key={index} className="border rounded p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(result.success)}
                              <Badge variant={result.success ? "default" : "destructive"}>{result.status}</Badge>
                              <span className="text-sm text-muted-foreground">{result.responseTime}ms</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          {result.error && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{result.error}</div>
                          )}

                          {result.data && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground">Response Data</summary>
                              <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
