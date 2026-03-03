import { createTable } from './egdesk-helpers';

async function createCustomers() {
  console.log('Creating Customers table...\n');

  await createTable('Customers', [
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
  ], {
    tableName: 'Customers',  // Force capital C to match API
    description: 'Customer information with TEXT IDs',
    uniqueKeyColumns: ['id'],
    duplicateAction: 'update'
  });

  console.log('✅ Customers table created!');
}

createCustomers().catch(console.error);
