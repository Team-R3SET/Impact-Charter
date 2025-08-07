import { NextRequest, NextResponse } from "next/server"
import { syncLocalPlansToAirtable, getBusinessPlans } from "@/lib/airtable"
import { LocalStorageManager } from "@/lib/local-storage"

// Only allow in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  if (!isDevelopment) {
    return NextResponse.json(
      { error: "Test endpoints are only available in development mode" },
      { status: 403 }
    )
  }
  
  try {
    const { userEmail } = await request.json()
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      )
    }
    
    // Create test plans
    const testPlans = [
      {
        planName: 'Test Plan 1 - ' + new Date().toISOString(),
        description: 'Test plan for sync testing',
        ownerEmail: userEmail,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        status: 'Draft'
      },
      {
        planName: 'Test Plan 2 - ' + new Date().toISOString(),
        description: 'Another test plan for sync testing',
        ownerEmail: userEmail,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        status: 'Draft'
      }
    ];
    
    // Clear existing test plans and create new ones
    const existingPlans = LocalStorageManager.getBusinessPlans(userEmail);
    const testPlanIds = [];
    
    for (const plan of testPlans) {
      const newPlan = LocalStorageManager.createBusinessPlan(plan);
      testPlanIds.push(newPlan.id);
    }
    
    // Sync plans to Airtable
    const syncResult = await syncLocalPlansToAirtable(userEmail);
    
    // Verify plans exist in Airtable
    const airtablePlans = await getBusinessPlans(userEmail);
    
    // Test duplicate detection by syncing again
    const secondSyncResult = await syncLocalPlansToAirtable(userEmail);
    
    return NextResponse.json({
      success: true,
      testPlansCreated: testPlans.length,
      initialSync: syncResult,
      verificationResult: {
        plansFound: airtablePlans.plans.length,
        airtableWorked: airtablePlans.airtableWorked
      },
      duplicateDetectionTest: secondSyncResult,
      testPlanIds
    })
    
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
