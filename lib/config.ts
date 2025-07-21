interface Config {
  app: {
    name: string
    url: string
    environment: "development" | "production" | "test"
  }
  liveblocks: {
    publicKey: string
    secretKey: string
    enabled: boolean
  }
  airtable: {
    apiKey: string
    baseId: string
    enabled: boolean
  }
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey: string
    enabled: boolean
  }
  logging: {
    level: "debug" | "info" | "warn" | "error"
    enabled: boolean
  }
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue
  if (!value) {
    console.warn(`Environment variable ${key} is not set`)
    return ""
  }
  return value
}

function validateConfig(config: Config): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.app.name) {
    errors.push("App name is required")
  }

  if (config.liveblocks.enabled && !config.liveblocks.secretKey) {
    errors.push("Liveblocks secret key is required when Liveblocks is enabled")
  }

  if (config.airtable.enabled && (!config.airtable.apiKey || !config.airtable.baseId)) {
    errors.push("Airtable API key and base ID are required when Airtable is enabled")
  }

  if (config.supabase.enabled && (!config.supabase.url || !config.supabase.anonKey)) {
    errors.push("Supabase URL and anon key are required when Supabase is enabled")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const config: Config = {
  app: {
    name: getEnvVar("NEXT_PUBLIC_APP_NAME", "Impact Charter"),
    url: getEnvVar("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    environment: getEnvVar("NODE_ENV", "development") as Config["app"]["environment"],
  },
  liveblocks: {
    publicKey: getEnvVar("NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY", ""),
    secretKey: getEnvVar("LIVEBLOCKS_SECRET_KEY", ""),
    enabled: !!getEnvVar("LIVEBLOCKS_SECRET_KEY"),
  },
  airtable: {
    apiKey: getEnvVar("AIRTABLE_API_KEY", ""),
    baseId: getEnvVar("AIRTABLE_BASE_ID", ""),
    enabled: !!(getEnvVar("AIRTABLE_API_KEY") && getEnvVar("AIRTABLE_BASE_ID")),
  },
  supabase: {
    url: getEnvVar("NEXT_PUBLIC_SUPABASE_URL", ""),
    anonKey: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""),
    serviceRoleKey: getEnvVar("SUPABASE_SERVICE_ROLE_KEY", ""),
    enabled: !!(getEnvVar("NEXT_PUBLIC_SUPABASE_URL") && getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")),
  },
  logging: {
    level: getEnvVar("LOG_LEVEL", "info") as Config["logging"]["level"],
    enabled: getEnvVar("LOG_LEVEL") !== "off",
  },
}

class ConfigManager {
  getLiveblocksConfig() {
    return {
      publicKey: config.liveblocks.publicKey,
      secretKey: config.liveblocks.secretKey,
    }
  }

  isLiveblocksConfigured() {
    return !!config.liveblocks.publicKey && !!config.liveblocks.secretKey
  }

  getAirtableConfig() {
    return {
      apiKey: config.airtable.apiKey,
      baseId: config.airtable.baseId,
    }
  }
}

export const configManager = new ConfigManager()

// Validate configuration on startup
const validation = validateConfig(config)
if (!validation.isValid) {
  console.error("Configuration validation failed:", validation.errors)
  if (config.app.environment === "production") {
    throw new Error("Invalid configuration in production environment")
  }
}

export function getServiceStatus() {
  return {
    liveblocks: {
      configured: config.liveblocks.enabled,
      status: config.liveblocks.enabled ? "active" : "disabled",
    },
    airtable: {
      configured: config.airtable.enabled,
      status: config.airtable.enabled ? "active" : "disabled",
    },
    supabase: {
      configured: config.supabase.enabled,
      status: config.supabase.enabled ? "active" : "disabled",
    },
  }
}

export function isServiceEnabled(service: keyof Omit<Config, "app" | "logging">): boolean {
  return config[service].enabled
}
