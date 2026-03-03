import { deleteTable, createTable } from './egdesk-helpers';

async function fixAllLowercase() {
  console.log('🔄 Converting all table names to lowercase...\n');

  const tablesToRecreate = [
    {
      oldName: 'Customers',
      newName: 'customers',
      schema: [
        { name: 'id', type: 'TEXT', notNull: true },
        { name: 'name', type: 'TEXT', notNull: true },
        { name: 'postcode', type: 'TEXT' },
        { name: 'address', type: 'TEXT' },
        { name: 'detailAddress', type: 'TEXT' },
        { name: 'shortAddress', type: 'TEXT' },
        { name: 'size', type: 'TEXT' },
        { name: 'phone1', type: 'TEXT' },
        { name: 'phone2', type: 'TEXT' },
        { name: 'createdAt', type: 'TEXT', notNull: true },
        { name: 'updatedAt', type: 'TEXT', notNull: true }
      ]
    },
    {
      oldName: 'Vendors',
      newName: 'vendors',
      schema: [
        { name: 'id', type: 'TEXT', notNull: true },
        { name: 'name', type: 'TEXT', notNull: true },
        { name: 'businessNumber', type: 'TEXT' },
        { name: 'representative', type: 'TEXT' },
        { name: 'phone', type: 'TEXT' },
        { name: 'address', type: 'TEXT' },
        { name: 'bankName', type: 'TEXT' },
        { name: 'accountNumber', type: 'TEXT' },
        { name: 'accountHolder', type: 'TEXT' },
        { name: 'isActive', type: 'INTEGER', defaultValue: 1 },
        { name: 'createdAt', type: 'TEXT', notNull: true },
        { name: 'updatedAt', type: 'TEXT', notNull: true }
      ]
    },
    {
      oldName: 'Estimates',
      newName: 'estimates',
      schema: [
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
      ]
    },
    {
      oldName: 'LineItems',
      newName: 'lineitems',
      schema: [
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
      ]
    },
    {
      oldName: 'PaymentMilestones',
      newName: 'paymentmilestones',
      schema: [
        { name: 'id', type: 'TEXT', notNull: true },
        { name: 'estimateId', type: 'TEXT', notNull: true },
        { name: 'type', type: 'TEXT' },
        { name: 'date', type: 'TEXT' },
        { name: 'percentage', type: 'REAL' },
        { name: 'amount', type: 'REAL' },
        { name: 'createdAt', type: 'TEXT', notNull: true },
        { name: 'updatedAt', type: 'TEXT', notNull: true }
      ]
    },
    {
      oldName: 'Schedules',
      newName: 'schedules',
      schema: [
        { name: 'id', type: 'TEXT', notNull: true },
        { name: 'estimateId', type: 'TEXT', notNull: true },
        { name: 'type', type: 'TEXT' },
        { name: 'date', type: 'TEXT' },
        { name: 'note', type: 'TEXT' },
        { name: 'createdAt', type: 'TEXT', notNull: true },
        { name: 'updatedAt', type: 'TEXT', notNull: true }
      ]
    },
    {
      oldName: 'SpendingRequests',
      newName: 'spendingrequests',
      schema: [
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
      ]
    },
    {
      oldName: 'Attachments',
      newName: 'attachments',
      schema: [
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
      ]
    }
  ];

  // Delete old tables (they already exist as lowercase except Customers)
  for (const table of tablesToRecreate) {
    try {
      await deleteTable(table.oldName);
      console.log(`  ✓ Deleted ${table.oldName}`);
    } catch (error: any) {
      console.log(`  ⚠️  Could not delete ${table.oldName}: ${error.message}`);
    }
  }

  console.log('\n✨ Creating all tables with lowercase names...\n');

  // Recreate all with explicit lowercase table names
  for (const table of tablesToRecreate) {
    await createTable(table.newName, table.schema as any, {
      tableName: table.newName,
      description: `${table.newName} table`,
      uniqueKeyColumns: ['id'],
      duplicateAction: 'update'
    });
    console.log(`  ✓ Created ${table.newName}`);
  }

  console.log('\n✅ All tables converted to lowercase!');
  console.log('\n📝 Next: Update egdesk.config.ts TABLE_NAMES to use lowercase');
}

fixAllLowercase().catch(console.error);
