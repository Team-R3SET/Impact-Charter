/**
 * Test script for verifying Airtable sync functionality
 * 
 * This script tests the sync functionality by:
 * 1. Creating local test plans
 * 2. Syncing them to Airtable
 * 3. Verifying they exist in Airtable
 * 4. Testing duplicate detection
 */

import { LocalStorageManager } from '../lib/local-storage';
import { syncLocalPlansToAirtable, getBusinessPlans } from '../lib/airtable';

// Test user email
const TEST_USER_EMAIL = 'test@example.com';

// Create test plans in local storage
async function createTestPlans() {
  console.log('Creating test plans in local storage...');
  
  // Clear existing test plans
  const existingPlans = LocalStorageManager.getBusinessPlans(TEST_USER_EMAIL);
  for (const plan of existingPlans) {
    LocalStorageManager.deleteBusinessPlan(plan.id);
  }
  
  // Create new test plans
  const testPlans = [
    {
      planName: 'Test Plan 1 - ' + new Date().toISOString(),
      description: 'Test plan for sync testing',
      ownerEmail: TEST_USER_EMAIL,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'Draft'
    },
    {
      planName: 'Test Plan 2 - ' + new Date().toISOString(),
      description: 'Another test plan for sync testing',
      ownerEmail: TEST_USER_EMAIL,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'Draft'
    }
  ];
  
  for (const plan of testPlans) {
    LocalStorageManager.createBusinessPlan(plan);
  }
  
  const createdPlans = LocalStorageManager.getBusinessPlans(TEST_USER_EMAIL);
  console.log(`Created ${createdPlans.length} test plans in local storage`);
  return createdPlans;
}

// Run the sync test
async function runSyncTest() {
  try {
    console.log('=== AIRTABLE SYNC TEST ===');
    
    // 1. Create test plans
    const localPlans = await createTestPlans();
    console.log(`Local plans created: ${localPlans.map(p => p.planName).join(', ')}`);
    
    // 2. Sync plans to Airtable
    console.log('\nSyncing plans to Airtable...');
    const syncResult = await syncLocalPlansToAirtable(TEST_USER_EMAIL);
    console.log('Sync result:', JSON.stringify(syncResult, null, 2));
    
    // 3. Verify plans exist in Airtable
    console.log('\nVerifying plans in Airtable...');
    const airtablePlans = await getBusinessPlans(TEST_USER_EMAIL);
    console.log(`Found ${airtablePlans.plans.length} plans in Airtable`);
    console.log(`Airtable operation ${airtablePlans.airtableWorked ? 'succeeded' : 'failed'}`);
    
    if (airtablePlans.airtableWorked) {
      console.log('Plans in Airtable:', airtablePlans.plans.map(p => p.planName).join(', '));
    }
    
    // 4. Test duplicate detection by syncing again
    console.log('\nTesting duplicate detection by syncing again...');
    const secondSyncResult = await syncLocalPlansToAirtable(TEST_USER_EMAIL);
    console.log('Second sync result:', JSON.stringify(secondSyncResult, null, 2));
    
    // 5. Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Initial sync: ${syncResult.syncedCount} synced, ${syncResult.skippedCount} skipped`);
    console.log(`Second sync: ${secondSyncResult.syncedCount} synced, ${secondSyncResult.skippedCount} skipped`);
    
    if (secondSyncResult.skippedCount === localPlans.length) {
      console.log('✓ Duplicate detection working correctly');
    } else {
      console.log('⚠ Duplicate detection may not be working correctly');
    }
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
runSyncTest();
