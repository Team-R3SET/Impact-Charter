import type { NextRequest } from "next/server"
import { getAirtableHealth } from "@/lib/airtable"
import { dataIntegrityManager } from "@/lib/data-integrity"
import { createApiResponse, createApiError } from "@/lib/api-utils"
import { logInfo, logError } from "@/lib/logging"

export async function GET(request: NextRequest) {
  try {
    logInfo("Health check requested", {
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for"),
    })

    // Check Airtable health
    const airtableHealth = await getAirtableHealth()

    // Check data integrity manager health
    const integrityHealth = dataIntegrityManager.getHealthStatus()

    // Validate data sources
    const dataSourceStatus = await dataIntegrityManager.validateDataSources()

    // Overall system health
    const overallHealth = {
      status: airtableHealth.status,
      timestamp: new Date().toISOString(),
      services: {
        airtable: {
          status: airtableHealth.connection.isConnected ? "healthy" : "unhealthy",
          latency: airtableHealth.connection.latency,
          features: airtableHealth.connection.features,
          error: airtableHealth.connection.error,
        },
        dataIntegrity: {
          status: integrityHealth.checksRegistered > 0 ? "healthy" : "unhealthy",
          checksRegistered: integrityHealth.checksRegistered,
          fallbackStrategiesAvailable: integrityHealth.fallbackStrategiesAvailable,
          dataSourcesConfigured: integrityHealth.dataSourcesConfigured,
        },
        dataSources: Object.fromEntries(dataSourceStatus),
      },
      recommendations: [] as string[],
    }

    // Add recommendations based on health status
    if (!airtableHealth.connection.isConnected) {
      overallHealth.recommendations.push("Configure Airtable credentials to enable full functionality")
    }

    if (integrityHealth.fallbackStrategiesAvailable === 0) {
      overallHealth.recommendations.push("No fallback strategies available - system may fail completely on errors")
    }

    if (airtableHealth.connection.latency && airtableHealth.connection.latency > 5000) {
      overallHealth.recommendations.push("High Airtable latency detected - consider implementing caching")
    }

    const availableDataSources = Array.from(dataSourceStatus.values()).filter(Boolean).length
    if (availableDataSources === 0) {
      overallHealth.recommendations.push("No data sources available - system will not function")
      overallHealth.status = "unhealthy"
    } else if (availableDataSources === 1) {
      overallHealth.recommendations.push("Only one data source available - consider adding redundancy")
      if (overallHealth.status === "healthy") {
        overallHealth.status = "degraded"
      }
    }

    logInfo("Health check completed", {
      status: overallHealth.status,
      recommendationCount: overallHealth.recommendations.length,
    })

    return createApiResponse(overallHealth)
  } catch (error) {
    logError("Health check failed", { error })
    return createApiError("Health check failed", 500, (error as Error).message)
  }
}
