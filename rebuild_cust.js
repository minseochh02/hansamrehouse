const apiUrl = 'http://localhost:8080';
const apiKey = 'dbd74264-3254-43b6-9e0a-d714732f5083';

async function callUserDataTool(toolName, args) {
  const body = JSON.stringify({ tool: toolName, arguments: args });
  const headers = { 'Content-Type': 'application/json', 'X-Api-Key': apiKey };
  const response = await fetch(`${apiUrl}/user-data/tools/call`, { method: 'POST', headers, body });
  const result = await response.json();
  const content = result.result?.content?.[0]?.text;
  return content ? JSON.parse(content) : null;
}

async function rebuildCustomers() {
  try {
    console.log('Fetching current customers...');
    const res = await callUserDataTool('user_data_query', { tableName: 'Customers' });
    const oldRows = res.rows || [];
    console.log(`Found ${oldRows.length} customers.`);

    console.log('Deleting all customers...');
    // user_data_delete_rows requires IDs. If IDs are null, we might need user_data_delete_table and recreate it.
    // Or try delete with filter.
    await callUserDataTool('user_data_delete_rows', { tableName: 'Customers', filters: { name: '%' } }); // Delete all names

    const newCustomers = [
      { id: 'CUST-001', name: '차민서', shortAddress: '배곧동 한라비발디캠퍼스', phone1: '01075235071' },
      { id: 'CUST-002', name: '테스트', shortAddress: '테스트 주소', phone1: '01012345678' }
    ];

    console.log('Inserting valid customers...');
    const insertRes = await callUserDataTool('user_data_insert_rows', {
      tableName: 'Customers',
      rows: newCustomers
    });
    console.log('Insert Result:', JSON.stringify(insertRes, null, 2));

    const check = await callUserDataTool('user_data_query', { tableName: 'Customers' });
    console.log('Final Customers:', JSON.stringify(check.rows, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

rebuildCustomers();
