import { listTables } from './egdesk-helpers';

async function list() {
  const result = await listTables();
  console.log('📋 Current tables:\n');
  console.log(JSON.stringify(result, null, 2));
}

list().catch(console.error);
