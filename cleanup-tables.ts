/**
 * Cleanup Script: Delete all customer table metadata
 */

import { deleteTable } from './egdesk-helpers';

async function cleanup() {
  console.log('🧹 Cleaning up customer tables...\n');

  const tablesToDelete = [
    'Customers',
    'Vendors',
    'Estimates',
    'LineItems',
    'PaymentMilestones',
    'Schedules',
    'SpendingRequests',
    'Attachments'
  ];

  for (const tableName of tablesToDelete) {
    try {
      await deleteTable(tableName);
      console.log(`  ✓ Deleted ${tableName}`);
    } catch (error: any) {
      console.log(`  ⚠️  ${tableName}: ${error.message}`);
    }
  }

  console.log('\n✅ Cleanup complete! Now run the migration script.');
}

cleanup().catch((error) => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});
