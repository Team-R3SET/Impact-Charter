import { LocalStorageManager } from "./local-storage"

// Type definitions
export interface BusinessPlan {
  id: string
  planName: string
  createdDate: string
  lastModified: string
  ownerEmail: string
  status: string
  description?: string
}

export interface BusinessPlanSection {
  id?: string
  planId: string
  sectionName: string
  sectionContent: string
  lastModified: string
  modifiedBy: string
  isComplete?: boolean
  submittedForReview?: boolean
  completedDate?: string
  completedBy?: string
  completedAt?: string
}

export interface UserProfile {
  id?: string
  email: string
  name: string
  role: string
  lastActive: string
}

// Helper function for Airtable operations with local fallback
async function withLocalFallback<T>(
  airtableOperation: () => Promise<T>,
  localFallback: () => T
): Promise<{ data: T; airtableWorked: boolean; error?: string; troubleshooting?: string }> {
  try {
    const data = await airtableOperation()
    return { data, airtableWorked: true }
  } catch (error) {
    console.warn("Airtable operation failed, using local fallback:", error)
    const data = localFallback()
    
    let troubleshooting = ""
    if (error instanceof Error) {
      if (error.message.includes("404")) {
        troubleshooting = "Table not found in Airtable. Please check your base setup and table names."
      } else if (error.message.includes("403")) {
        troubleshooting = "Permission denied. Check your Personal Access Token scopes and base permissions."
      } else if (error.message.includes("401")) {
        troubleshooting = "Invalid credentials. Please verify your Personal Access Token in Settings."
      } else {
        troubleshooting = "Connection failed. Check your Airtable configuration and internet connection."
      }
    }
    
    return { 
      data, 
      airtableWorked: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      troubleshooting
    }
  }
}

// Business Plans functions
export async function getBusinessPlans(ownerEmail: string): Promise<{ 
  plans: BusinessPlan[]; 
  airtableWorked: boolean; 
  error?: string;
  troubleshooting?: string;
}> {
  const result = await withLocalFallback(
    async () => {
      const baseId = process.env.AIRTABLE_BASE_ID
      const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN

      if (!baseId || !token) {
        throw new Error("Airtable credentials missing")
      }

      const url = `https://api.airtable.com/v0/${baseId}/Business%20Plans?filterByFormula={CreatedBy}='${ownerEmail}'`
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 404) {
        throw new Error("Business Plans table not found in Airtable base")
      }

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      const data = await res.json()
      return data.records.map((record: any) => ({
        id: record.id,
        planName: record.fields.Name || "",
        createdDate: record.fields.CreatedAt || new Date().toISOString(),
        lastModified: record.fields.UpdatedAt || new Date().toISOString(),
        ownerEmail: record.fields.CreatedBy || ownerEmail,
        status: record.fields.Status || "Draft",
        description: record.fields.Description || "",
      }))
    },
    () => LocalStorageManager.getBusinessPlans(ownerEmail)
  )

  return {
    plans: result.data,
    airtableWorked: result.airtableWorked,
    error: result.error,
    troubleshooting: result.troubleshooting
  }
}

export async function getBusinessPlan(planId: string): Promise<BusinessPlan | null> {
  console.log(`[getBusinessPlan] Attempting to fetch plan: ${planId}`)
  
  try {
    const result = await withLocalFallback(
      async () => {
        console.log(`[getBusinessPlan] Trying Airtable for plan: ${planId}`)
        const baseId = process.env.AIRTABLE_BASE_ID
        const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN

        if (!baseId || !token) {
          console.log(`[getBusinessPlan] Airtable credentials missing`)
          throw new Error("Airtable credentials missing")
        }

        const url = `https://api.airtable.com/v0/${baseId}/Business%20Plans/${planId}`
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          if (res.status === 404) {
            console.log(`[getBusinessPlan] Plan not found in Airtable: ${planId}`)
            return null
          }
          const errorText = await res.text()
          console.log(`[getBusinessPlan] Airtable error: ${res.status} - ${errorText}`)
          throw new Error(`HTTP ${res.status}: ${errorText}`)
        }

        const data = await res.json()
        const plan = {
          id: data.id,
          planName: data.fields.Name || "",
          createdDate: data.fields.CreatedAt || new Date().toISOString(),
          lastModified: data.fields.UpdatedAt || new Date().toISOString(),
          ownerEmail: data.fields.CreatedBy || "",
          status: data.fields.Status || "Draft",
          description: data.fields.Description || "",
        }
        console.log(`[getBusinessPlan] Found plan in Airtable:`, plan)
        return plan
      },
      () => {
        console.log(`[getBusinessPlan] Falling back to local storage for plan: ${planId}`)
        try {
          // Added detailed logging for local storage retrieval
          const allPlans = LocalStorageManager.getAllBusinessPlans()
          console.log(`[getBusinessPlan] All plans in localStorage:`, allPlans.map(p => ({ id: p.id, name: p.planName })))
          
          const plan = LocalStorageManager.getBusinessPlan(planId)
          if (plan) {
            console.log(`[getBusinessPlan] Found plan in localStorage:`, plan)
          } else {
            console.log(`[getBusinessPlan] Plan not found in localStorage: ${planId}`)
            console.log(`[getBusinessPlan] Available plan IDs:`, allPlans.map(p => p.id))
          }
          return plan
        } catch (error) {
          console.warn("Local storage getBusinessPlan failed:", error)
          return null
        }
      }
    )

    console.log(`[getBusinessPlan] Final result for ${planId}:`, result.data)
    return result.data
  } catch (error) {
    console.warn("getBusinessPlan failed completely:", error)
    return null
  }
}

export async function createBusinessPlan(plan: Omit<BusinessPlan, "id">): Promise<{ 
  plan: BusinessPlan; 
  airtableWorked: boolean; 
  error?: string;
  troubleshooting?: string;
}> {
  const result = await withLocalFallback(
    async () => {
      const baseId = process.env.AIRTABLE_BASE_ID
      const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN

      if (!baseId || !token) {
        throw new Error("Airtable credentials missing")
      }

      const fields = {
        Name: plan.planName,
        Description: plan.description || "",
        CreatedBy: plan.ownerEmail,
        CreatedAt: plan.createdDate,
        UpdatedAt: plan.lastModified,
      }

      const url = `https://api.airtable.com/v0/${baseId}/Business%20Plans`
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        if (res.status === 404) {
          throw new Error(`Table "Business Plans" not found in your Airtable base. Please create this table with the following fields: Name (Single line text), Description (Long text), CreatedBy (Single line text), CreatedAt (Date), UpdatedAt (Date)`)
        } else if (res.status === 403) {
          throw new Error(`Access forbidden. Ensure your Personal Access Token has 'data.records:write' scope and access to the "Business Plans" table.`)
        } else if (res.status === 401) {
          throw new Error(`Invalid Personal Access Token. Please check your Airtable credentials in Settings.`)
        } else {
          throw new Error(`HTTP ${res.status}: ${errorText}`)
        }
      }

      const data = await res.json()
      return { id: data.id, ...plan }
    },
    () => LocalStorageManager.createBusinessPlan(plan)
  )

  return {
    plan: result.data,
    airtableWorked: result.airtableWorked,
    error: result.error,
    troubleshooting: result.troubleshooting
  }
}

export async function deleteBusinessPlan(planId: string): Promise<{ 
  success: boolean; 
  airtableWorked: boolean; 
  error?: string;
  troubleshooting?: string;
}> {
  try {
    let airtableWorked = false;
    let troubleshooting = "";
    
    try {
      const baseId = process.env.AIRTABLE_BASE_ID;
      const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
      
      if (!baseId || !token) {
        troubleshooting = "Airtable credentials are missing. Please check your environment variables.";
        throw new Error("Airtable credentials missing");
      }
      
      const url = `https://api.airtable.com/v0/${baseId}/Business%20Plans/${planId}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          troubleshooting = "The plan was not found in Airtable. It may have been deleted already or the table structure is incorrect.";
          throw new Error("Plan not found in Airtable");
        } else if (res.status === 403) {
          troubleshooting = "Your Personal Access Token doesn't have permission to delete records. Ensure it has 'data.records:write' scope.";
          throw new Error("Permission denied");
        } else {
          const errorText = await res.text();
          troubleshooting = `Airtable API error: ${errorText}. Check your Airtable base configuration.`;
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
      }
      
      airtableWorked = true;
    } catch (airtableError) {
      console.warn("[deleteBusinessPlan] Airtable operation failed:", airtableError);
    }
    
    const localResult = LocalStorageManager.deleteBusinessPlan(planId);
    
    return {
      success: true,
      airtableWorked,
      troubleshooting: !airtableWorked ? troubleshooting : undefined
    };
  } catch (error) {
    console.error("[deleteBusinessPlan] Error:", error);
    return {
      success: false,
      airtableWorked: false,
      error: error instanceof Error ? error.message : "Unknown error",
      troubleshooting: "There was an error deleting the plan. Check the console for more details."
    };
  }
}

// User Profile functions
export async function getUserProfile(email: string): Promise<UserProfile | null> {
  const result = await withLocalFallback(
    async () => {
      const baseId = process.env.AIRTABLE_BASE_ID
      const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN

      if (!baseId || !token) {
        throw new Error("Airtable credentials missing")
      }

      const url = `https://api.airtable.com/v0/${baseId}/User%20Profiles?filterByFormula={Email}='${email}'`
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      const data = await res.json()
      if (data.records.length === 0) {
        return null
      }

      const record = data.records[0]
      return {
        id: record.id,
        email: record.fields.Email || email,
        name: record.fields.Name || "",
        role: record.fields.Role || "Viewer",
        lastActive: record.fields["Last Active"] || new Date().toISOString(),
      }
    },
    () => LocalStorageManager.getUserProfile(email)
  )

  return result.data
}

export async function createOrUpdateUserProfile(profile: Omit<UserProfile, "id">): Promise<UserProfile> {
  const result = await withLocalFallback(
    async () => {
      const baseId = process.env.AIRTABLE_BASE_ID
      const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN

      if (!baseId || !token) {
        throw new Error("Airtable credentials missing")
      }

      // First check if user exists
      const existingProfile = await getUserProfile(profile.email)
      
      const fields = {
        Email: profile.email,
        Name: profile.name,
        Role: profile.role,
        "Last Active": profile.lastActive,
      }

      let url: string
      let method: string
      
      if (existingProfile?.id) {
        // Update existing
        url = `https://api.airtable.com/v0/${baseId}/User%20Profiles/${existingProfile.id}`
        method = "PATCH"
      } else {
        // Create new
        url = `https://api.airtable.com/v0/${baseId}/User%20Profiles`
        method = "POST"
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      const data = await res.json()
      return {
        id: data.id,
        email: data.fields.Email,
        name: data.fields.Name,
        role: data.fields.Role,
        lastActive: data.fields["Last Active"],
      }
    },
    () => {
      const userProfile: UserProfile = { ...profile, id: `local-${Date.now()}` }
      LocalStorageManager.saveUserProfile(userProfile)
      return userProfile
    }
  )

  return result.data
}

// Business Plan Sections functions
export async function updateBusinessPlanSection(section: BusinessPlanSection): Promise<{ airtableWorked: boolean; error?: string }> {
  const result = await withLocalFallback(
    async () => {
      const fields = {
        planId: section.planId,
        sectionName: section.sectionName,
        sectionContent: section.sectionContent,
        lastModified: section.lastModified,
        modifiedBy: section.modifiedBy,
        isComplete: !!section.isComplete,
        submittedForReview: !!section.submittedForReview,
        completedDate: section.completedDate,
      }

      const baseId = process.env.AIRTABLE_BASE_ID
      const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN

      if (!baseId || !token) {
        throw new Error("Airtable credentials missing")
      }

      // Try to find existing record first
      const searchUrl = `https://api.airtable.com/v0/${baseId}/Business%20Plan%20Sections?filterByFormula=AND({Plan ID}='${section.planId}',{Section Name}='${section.sectionName}')`
      const searchRes = await fetch(searchUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!searchRes.ok) {
        const errorText = await searchRes.text()
        throw new Error(`HTTP ${searchRes.status}: ${errorText}`)
      }

      const searchData = await searchRes.json()
      
      let url: string
      let method: string
      
      if (searchData.records.length > 0) {
        // Update existing
        url = `https://api.airtable.com/v0/${baseId}/Business%20Plan%20Sections/${searchData.records[0].id}`
        method = "PATCH"
      } else {
        // Create new
        url = `https://api.airtable.com/v0/${baseId}/Business%20Plan%20Sections`
        method = "POST"
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      return true
    },
    () => {
      LocalStorageManager.savePlanSection(section)
      return true
    }
  )

  return {
    airtableWorked: result.airtableWorked,
    error: result.error
  }
}

// Adding sync function to push local plans to Airtable with duplicate detection
export async function syncLocalPlansToAirtable(ownerEmail: string): Promise<{
  success: boolean;
  syncedCount: number;
  skippedCount: number;
  errors: string[];
  details: string[];
}> {
  const results = {
    success: true,
    syncedCount: 0,
    skippedCount: 0,
    errors: [] as string[],
    details: [] as string[]
  };

  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;

    if (!baseId || !token) {
      throw new Error("Airtable credentials missing");
    }

    // Get local plans
    const localPlans = LocalStorageManager.getBusinessPlans(ownerEmail);
    results.details.push(`Found ${localPlans.length} local plans to sync`);

    if (localPlans.length === 0) {
      results.details.push("No local plans found to sync");
      return results;
    }

    // Get existing Airtable plans to check for duplicates
    const existingPlansUrl = `https://api.airtable.com/v0/${baseId}/Business%20Plans?filterByFormula={CreatedBy}='${ownerEmail}'`;
    const existingRes = await fetch(existingPlansUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    let existingPlans: any[] = [];
    if (existingRes.ok) {
      const existingData = await existingRes.json();
      existingPlans = existingData.records || [];
      results.details.push(`Found ${existingPlans.length} existing plans in Airtable`);
    }

    // Create a set of existing plan names for duplicate detection
    const existingPlanNames = new Set(
      existingPlans.map(record => record.fields.Name?.toLowerCase().trim())
    );

    // Sync each local plan
    for (const localPlan of localPlans) {
      const planNameLower = localPlan.planName.toLowerCase().trim();
      
      // Check for duplicates
      if (existingPlanNames.has(planNameLower)) {
        results.skippedCount++;
        results.details.push(`Skipped "${localPlan.planName}" - already exists in Airtable`);
        continue;
      }

      try {
        // Create plan in Airtable
        const fields = {
          Name: localPlan.planName,
          Description: localPlan.description || "",
          CreatedBy: localPlan.ownerEmail,
          CreatedAt: localPlan.createdDate,
          UpdatedAt: localPlan.lastModified,
        };

        const createUrl = `https://api.airtable.com/v0/${baseId}/Business%20Plans`;
        const createRes = await fetch(createUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields }),
        });

        if (createRes.ok) {
          const createdData = await createRes.json();
          results.syncedCount++;
          results.details.push(`✓ Synced "${localPlan.planName}" to Airtable`);
          
          // Add to existing names set to prevent duplicates in this batch
          existingPlanNames.add(planNameLower);
          
          // Update local plan with Airtable ID
          const updatedPlan = { ...localPlan, id: createdData.id };
          LocalStorageManager.updateBusinessPlan(updatedPlan);
        } else {
          // Enhanced error handling for specific HTTP status codes
          let errorMessage = `Failed to sync "${localPlan.planName}"`;
          
          if (createRes.status === 404) {
            errorMessage += ': Table "Business Plans" not found. Please create this table in your Airtable base with fields: Name (Single line text), Description (Long text), CreatedBy (Single line text), CreatedAt (Date), UpdatedAt (Date)';
          } else if (createRes.status === 403) {
            errorMessage += ': Permission denied. Please ensure your personal access token has "data.records:write" scope and access to this base';
          } else if (createRes.status === 401) {
            errorMessage += ': Invalid credentials. Please check your personal access token';
          } else {
            try {
              const errorData = await createRes.json();
              errorMessage += `: ${errorData.error?.message || createRes.statusText}`;
            } catch {
              errorMessage += `: HTTP ${createRes.status} ${createRes.statusText}`;
            }
          }
          
          results.errors.push(errorMessage);
          results.success = false;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`Error syncing "${localPlan.planName}": ${errorMsg}`);
        results.success = false;
      }
    }

    results.details.push(`Sync complete: ${results.syncedCount} synced, ${results.skippedCount} skipped, ${results.errors.length} errors`);
    
  } catch (error) {
    results.success = false;
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Sync failed: ${errorMsg}`);
  }

  return results;
}
