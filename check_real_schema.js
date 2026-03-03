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

async function checkRealSchema() {
  try {
    const custSchema = await callUserDataTool('user_data_get_schema', { tableName: 'Customers' });
    console.log('Real Customers Schema:', JSON.stringify(custSchema, null, 2));
    
    const estSchema = await callUserDataTool('user_data_get_schema', { tableName: 'Estimates' });
    console.log('Real Estimates Schema:', JSON.stringify(estSchema, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRealSchema();
