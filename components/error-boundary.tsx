"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, RefreshCw, Bug, Home, Mail } from "lucide-react"
import { logError } from "@/lib/logging"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: "page" | "component" | "critical"
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || `error-${Date.now()}`

    // Log the error
    logError("Error boundary caught error", {
      errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level: this.props.level || "component",
      retryCount: this.state.retryCount,
    })

    this.setState({
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: this.state.retryCount + 1,
      })
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state
    const errorReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }

    // In a real app, you'd send this to your error reporting service
    console.error("Error Report:", errorReport)

    // For demo, we'll just copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      alert("Error report copied to clipboard. Please send this to support.")
    })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorId, retryCount } = this.state
      const canRetry = retryCount < this.maxRetries
      const level = this.props.level || "component"

      return (
        <Card className="w-full max-w-2xl mx-auto my-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <CardTitle className="text-red-700">
                {level === "critical" ? "Critical Error" : level === "page" ? "Page Error" : "Component Error"}
              </CardTitle>
              <Badge variant="destructive" className="ml-auto">
                Error ID: {errorId}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <Bug className="h-4 w-4" />
              <AlertDescription>
                <strong>Something went wrong:</strong> {error?.message || "An unexpected error occurred"}
              </AlertDescription>
            </Alert>

            {retryCount > 0 && (
              <Alert>
                <AlertDescription>
                  This error has occurred {retryCount} time{retryCount > 1 ? "s" : ""}.
                  {canRetry ? " You can try again." : " Maximum retry attempts reached."}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-2">
              {canRetry && (
                <Button onClick={this.handleRetry} variant="default" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again ({this.maxRetries - retryCount} left)
                </Button>
              )}

              <Button onClick={this.handleReset} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              {level === "page" && (
                <Button onClick={this.handleReload} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              )}

              <Button onClick={this.handleGoHome} variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>

              <Button onClick={this.handleReportError} variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Report Error
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                  Technical Details (Development Only)
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Convenience wrapper components for different error levels
export function PageErrorBoundary({
  children,
  onError,
}: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
  return (
    <ErrorBoundary level="page" onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({
  children,
  onError,
}: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
  return (
    <ErrorBoundary level="component" onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

export function CriticalErrorBoundary({
  children,
  onError,
}: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
  return (
    <ErrorBoundary level="critical" onError={onError}>
      {children}
    </ErrorBoundary>
  )
}
