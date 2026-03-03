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

async function checkSpecificEstimate() {
  const targetId = 'EST-1772550953611';
  try {
    console.log(`Searching for ID: ${targetId}`);
    const res = await callUserDataTool('user_data_query', { tableName: 'Estimates' });
    const allRows = res.rows || [];
    console.log(`Total estimates in DB: ${allRows.length}`);
    
    const match = allRows.find(r => r.id === targetId);
    if (match) {
      console.log('Match found:', JSON.stringify(match, null, 2));
    } else {
      console.log('No exact match found.');
      console.log('First 5 IDs in DB:', allRows.slice(0, 5).map(r => r.id));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSpecificEstimate();
