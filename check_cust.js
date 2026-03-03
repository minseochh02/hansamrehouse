const apiUrl = 'http://localhost:8080';
const apiKey = 'dbd74264-3254-43b6-9e0a-d714732f5083';

async function callUserDataTool(toolName, args) {
  const body = JSON.stringify({ tool: toolName, arguments: args });
  const headers = { 'Content-Type': 'application/json', 'X-Api-Key': apiKey };
  const response = await fetch(`${apiUrl}/user-data/tools/call`, { method: 'POST', headers, body });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Tool call failed');
  const content = result.result?.content?.[0]?.text;
  return content ? JSON.parse(content) : null;
}

async function checkCustomerSchema() {
  try {
    const schema = await callUserDataTool('user_data_get_schema', { tableName: 'Customers' });
    console.log('Customers Schema:', JSON.stringify(schema, null, 2));
    const data = await callUserDataTool('user_data_query', { tableName: 'Customers' });
    console.log('Customers Data:', JSON.stringify(data.rows, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCustomerSchema();
