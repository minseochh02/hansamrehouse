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

async function testAutoId() {
  try {
    console.log('Inserting customer without ID...');
    const res = await callUserDataTool('user_data_insert_rows', {
      tableName: 'Customers',
      rows: [{ name: 'AutoID-Test', shortAddress: 'Test' }]
    });
    console.log('Result:', JSON.stringify(res, null, 2));
    
    const check = await callUserDataTool('user_data_query', { tableName: 'Customers', filters: { name: 'AutoID-Test' } });
    console.log('Check:', JSON.stringify(check.rows, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAutoId();
