import { createTable } from './egdesk-helpers';

async function createRemaining() {
  console.log('Creating remaining tables with TEXT IDs...\n');

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

  console.log('\n✅ All tables created successfully!');
  console.log('\n📋 Summary:');
  console.log('   ✓ Customers (TEXT IDs)');
  console.log('   ✓ Vendors (TEXT IDs)');
  console.log('   ✓ Estimates (TEXT IDs)');
  console.log('   ✓ LineItems (TEXT IDs)');
  console.log('   ✓ PaymentMilestones (TEXT IDs)');
  console.log('   ✓ Schedules (TEXT IDs)');
  console.log('   ✓ SpendingRequests (TEXT IDs)');
  console.log('   ✓ Attachments (TEXT IDs)');
  console.log('\n   Master tables untouched:');
  console.log('   ✓ Employees');
  console.log('   ✓ MasterItems');
  console.log('   ✓ MasterSubCategories');
  console.log('   ✓ MasterCategories');
}

createRemaining().catch(console.error);
