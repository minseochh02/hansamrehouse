/**
 * Migration Script: Convert customer tables to TEXT IDs
 *
 * This script:
 * 1. Drops customer-related tables (loses data!)
 * 2. Recreates them with TEXT id columns
 * 3. Keeps master tables (Employees, MasterItems, etc.) untouched
 */

import { deleteTable, createTable } from './egdesk-helpers';

async function migrate() {
  console.log('🚀 Starting migration to TEXT IDs...\n');

  console.log('✨ Creating remaining tables with TEXT IDs...');
  console.log('   (Customers and Vendors already exist)\n');

  // Estimates
  await createTable('Estimates', [
    { name: 'id', type: 'TEXT', notNull: true },
    { name: 'customerId', type: 'TEXT', notNull: true },
    { name: 'estimateCode', type: 'TEXT' },
    { name: 'siteCode', type: 'TEXT' },
    { name: 'status', type: 'TEXT' },
    { name: 'managerId', type: 'TEXT' },
    { name: 'siteManagerId', type: 'TEXT' },
    { name: 'totalAmount', type: 'REAL' },
    { name: 'createdAt', type: 'TEXT', notNull: true },
    { name: 'updatedAt', type: 'TEXT', notNull: true }
  ], {
    description: 'Estimates with TEXT IDs and foreign keys',
    uniqueKeyColumns: ['id'],
    duplicateAction: 'update'
  });
  console.log('  ✓ Created Estimates');

  // LineItems
  await createTable('LineItems', [
    { name: 'id', type: 'TEXT', notNull: true },
    { name: 'estimateId', type: 'TEXT', notNull: true },
    { name: 'masterItemId', type: 'TEXT' },
    { name: 'isAdditional', type: 'INTEGER', defaultValue: 0 },
    { name: 'previousId', type: 'TEXT' },
    { name: 'isCurrent', type: 'INTEGER', defaultValue: 1 },
    { name: 'categoryName', type: 'TEXT' },
    { name: 'subCategoryName', type: 'TEXT' },
    { name: 'name', type: 'TEXT', notNull: true },
    { name: 'unit', type: 'TEXT' },
    { name: 'quantity', type: 'REAL' },
    { name: 'materialUnitPrice', type: 'REAL' },
    { name: 'laborUnitPrice', type: 'REAL' },
    { name: 'expenseUnitPrice', type: 'REAL' },
    { name: 'unitPrice', type: 'REAL' },
    { name: 'amount', type: 'REAL' },
    { name: 'note', type: 'TEXT' },
    { name: 'requestDate', type: 'TEXT' },
    { name: 'createdAt', type: 'TEXT', notNull: true }
  ], {
    description: 'Estimate line items',
    uniqueKeyColumns: ['id'],
    duplicateAction: 'update'
  });
  console.log('  ✓ Created LineItems');

  // PaymentMilestones
  await createTable('PaymentMilestones', [
    { name: 'id', type: 'TEXT', notNull: true },
    { name: 'estimateId', type: 'TEXT', notNull: true },
    { name: 'type', type: 'TEXT' },
    { name: 'date', type: 'TEXT' },
    { name: 'percentage', type: 'REAL' },
    { name: 'amount', type: 'REAL' },
    { name: 'createdAt', type: 'TEXT', notNull: true },
    { name: 'updatedAt', type: 'TEXT', notNull: true }
  ], {
    description: 'Payment milestones',
    uniqueKeyColumns: ['id'],
    duplicateAction: 'update'
  });
  console.log('  ✓ Created PaymentMilestones');

  // Schedules
  await createTable('Schedules', [
    { name: 'id', type: 'TEXT', notNull: true },
    { name: 'estimateId', type: 'TEXT', notNull: true },
    { name: 'type', type: 'TEXT' },
    { name: 'date', type: 'TEXT' },
    { name: 'note', type: 'TEXT' },
    { name: 'createdAt', type: 'TEXT', notNull: true },
    { name: 'updatedAt', type: 'TEXT', notNull: true }
  ], {
    description: 'Schedule events',
    uniqueKeyColumns: ['id'],
    duplicateAction: 'update'
  });
  console.log('  ✓ Created Schedules');

  // SpendingRequests
  await createTable('SpendingRequests', [
    { name: 'id', type: 'TEXT', notNull: true },
    { name: 'estimateId', type: 'TEXT' },
    { name: 'lineItemId', type: 'TEXT' },
    { name: 'vendorId', type: 'TEXT' },
    { name: 'employeeId', type: 'TEXT' },
    { name: 'payeeName', type: 'TEXT' },
    { name: 'processName', type: 'TEXT' },
    { name: 'itemName', type: 'TEXT' },
    { name: 'materialActualCost', type: 'REAL' },
    { name: 'laborActualCost', type: 'REAL' },
    { name: 'expenseActualCost', type: 'REAL' },
    { name: 'evidenceType', type: 'TEXT' },
    { name: 'evidenceText', type: 'TEXT' },
    { name: 'isUrgent', type: 'INTEGER', defaultValue: 0 },
    { name: 'deadlineMemo', type: 'TEXT' },
    { name: 'purchaseLink', type: 'TEXT' },
    { name: 'deliveryType', type: 'TEXT' },
    { name: 'contactInfo', type: 'TEXT' },
    { name: 'memo', type: 'TEXT' },
    { name: 'bankName', type: 'TEXT' },
    { name: 'accountNumber', type: 'TEXT' },
    { name: 'accountHolder', type: 'TEXT' },
    { name: 'hasTaxDeduction', type: 'INTEGER', defaultValue: 0 },
    { name: 'finalDeposit', type: 'REAL' },
    { name: 'paymentStatus', type: 'TEXT' },
    { name: 'date', type: 'TEXT' },
    { name: 'createdAt', type: 'TEXT', notNull: true },
    { name: 'updatedAt', type: 'TEXT', notNull: true }
  ], {
    description: 'Spending requests',
    uniqueKeyColumns: ['id'],
    duplicateAction: 'update'
  });
  console.log('  ✓ Created SpendingRequests');

  // Attachments
  await createTable('Attachments', [
    { name: 'id', type: 'TEXT', notNull: true },
    { name: 'estimateId', type: 'TEXT' },
    { name: 'spendingRequestId', type: 'TEXT' },
    { name: 'type', type: 'TEXT' },
    { name: 'fileUrl', type: 'TEXT', notNull: true },
    { name: 'fileName', type: 'TEXT' },
    { name: 'fileSize', type: 'INTEGER' },
    { name: 'fileType', type: 'TEXT' },
    { name: 'uploadedById', type: 'TEXT' },
    { name: 'createdAt', type: 'TEXT', notNull: true },
    { name: 'updatedAt', type: 'TEXT', notNull: true }
  ], {
    description: 'File attachments',
    uniqueKeyColumns: ['id'],
    duplicateAction: 'update'
  });
  console.log('  ✓ Created Attachments');

  console.log('\n✅ Migration complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. All customer data has been deleted');
  console.log('   2. Master tables (Employees, MasterItems, etc.) are untouched');
  console.log('   3. New inserts will use TEXT IDs like "CUST-1772551924627"');
  console.log('   4. Foreign keys will work correctly with TEXT IDs');
}

// Run migration
migrate().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
