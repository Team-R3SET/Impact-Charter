// Local storage fallback for business plans and user data
import type { BusinessPlan, BusinessPlanSection, UserProfile } from "@/lib/airtable"

const STORAGE_KEYS = {
  BUSINESS_PLANS: "business_plans",
  PLAN_SECTIONS: "plan_sections",
  USER_PROFILES: "user_profiles",
  LAST_SYNC: "last_airtable_sync",
}

// Generate sample business plans for demo
const generateSamplePlans = (ownerEmail: string): BusinessPlan[] => [
  {
    id: "local-plan-1",
    planName: "Tech Startup MVP",
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ownerEmail,
    status: "In Progress",
  },
  {
    id: "local-plan-2",
    planName: "E-commerce Platform",
    createdDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    ownerEmail,
    status: "Draft",
  },
  {
    id: "local-plan-3",
    planName: "SaaS Analytics Tool",
    createdDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ownerEmail,
    status: "Complete",
  },
]

export class LocalStorageManager {
  static getBusinessPlans(ownerEmail: string): BusinessPlan[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUSINESS_PLANS)
      if (!stored) {
        // First time - create sample plans
        const samplePlans = generateSamplePlans(ownerEmail)
        this.saveBusinessPlans(samplePlans)
        return samplePlans
      }

      const allPlans: BusinessPlan[] = JSON.parse(stored)
      return allPlans.filter((plan) => plan.ownerEmail === ownerEmail)
    } catch (error) {
      console.warn("Failed to load plans from localStorage:", error)
      return generateSamplePlans(ownerEmail)
    }
  }

  static saveBusinessPlans(plans: BusinessPlan[]): void {
    try {
      const existing = this.getAllBusinessPlans()
      const updated = [...existing.filter((p) => !plans.find((np) => np.id === p.id)), ...plans]
      localStorage.setItem(STORAGE_KEYS.BUSINESS_PLANS, JSON.stringify(updated))
    } catch (error) {
      console.warn("Failed to save plans to localStorage:", error)
    }
  }

  static getAllBusinessPlans(): BusinessPlan[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUSINESS_PLANS)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn("Failed to load all plans from localStorage:", error)
      return []
    }
  }

  static getBusinessPlan(planId: string): BusinessPlan | null {
    try {
      const plans = this.getAllBusinessPlans()
      return plans.find((plan) => plan.id === planId) || null
    } catch (error) {
      console.warn("Failed to get plan from localStorage:", error)
      return null
    }
  }

  static createBusinessPlan(plan: Omit<BusinessPlan, "id">): BusinessPlan {
    const newPlan: BusinessPlan = {
      ...plan,
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    const existing = this.getAllBusinessPlans()
    this.saveBusinessPlans([...existing, newPlan])
    return newPlan
  }

  static updateBusinessPlan(planId: string, updates: Partial<BusinessPlan>): BusinessPlan | null {
    try {
      const plans = this.getAllBusinessPlans()
      const planIndex = plans.findIndex((p) => p.id === planId)

      if (planIndex === -1) return null

      plans[planIndex] = { ...plans[planIndex], ...updates, lastModified: new Date().toISOString() }
      this.saveBusinessPlans(plans)
      return plans[planIndex]
    } catch (error) {
      console.warn("Failed to update plan in localStorage:", error)
      return null
    }
  }

  static deleteBusinessPlan(planId: string): boolean {
    try {
      const plans = this.getAllBusinessPlans()
      const filtered = plans.filter((p) => p.id !== planId)

      if (filtered.length === plans.length) return false

      localStorage.setItem(STORAGE_KEYS.BUSINESS_PLANS, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.warn("Failed to delete plan from localStorage:", error)
      return false
    }
  }

  static getPlanSections(planId: string): BusinessPlanSection[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAN_SECTIONS)
      if (!stored) return []

      const allSections: BusinessPlanSection[] = JSON.parse(stored)
      return allSections.filter((section) => section.planId === planId)
    } catch (error) {
      console.warn("Failed to load sections from localStorage:", error)
      return []
    }
  }

  static savePlanSection(section: BusinessPlanSection): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAN_SECTIONS)
      const allSections: BusinessPlanSection[] = stored ? JSON.parse(stored) : []

      const existingIndex = allSections.findIndex(
        (s) => s.planId === section.planId && s.sectionName === section.sectionName,
      )

      if (existingIndex >= 0) {
        allSections[existingIndex] = section
      } else {
        allSections.push(section)
      }

      localStorage.setItem(STORAGE_KEYS.PLAN_SECTIONS, JSON.stringify(allSections))
    } catch (error) {
      console.warn("Failed to save section to localStorage:", error)
    }
  }

  static getUserProfile(email: string): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILES)
      if (!stored) return null

      const profiles: UserProfile[] = JSON.parse(stored)
      return profiles.find((profile) => profile.email === email) || null
    } catch (error) {
      console.warn("Failed to load user profile from localStorage:", error)
      return null
    }
  }

  static saveUserProfile(profile: UserProfile): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILES)
      const profiles: UserProfile[] = stored ? JSON.parse(stored) : []

      const existingIndex = profiles.findIndex((p) => p.email === profile.email)

      if (existingIndex >= 0) {
        profiles[existingIndex] = profile
      } else {
        profiles.push(profile)
      }

      localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles))
    } catch (error) {
      console.warn("Failed to save user profile to localStorage:", error)
    }
  }

  static setLastSync(timestamp: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp)
    } catch (error) {
      console.warn("Failed to save sync timestamp:", error)
    }
  }

  static getLastSync(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
    } catch (error) {
      console.warn("Failed to get sync timestamp:", error)
      return null
    }
  }

  static clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.warn("Failed to clear localStorage:", error)
    }
  }
}
