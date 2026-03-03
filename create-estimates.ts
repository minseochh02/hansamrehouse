import { createTable, deleteTable } from './egdesk-helpers';

async function createEstimates() {
  console.log('Dropping Estimates table if it exists...\n');

  try {
    await deleteTable('Estimates');
    console.log('✓ Dropped Estimates\n');
  } catch (error: any) {
    console.log(`⚠️  Could not drop: ${error.message}\n`);
  }

  console.log('Creating Estimates table...\n');

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
    description: 'Estimates with TEXT IDs',
    uniqueKeyColumns: ['id'],
    duplicateAction: 'update'
  });

  console.log('✅ Estimates table created!');
}

createEstimates().catch(console.error);
