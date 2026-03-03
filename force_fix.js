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

async function forceFix() {
  try {
    const customerId = 'CUST-FIXED-1';
    console.log('Inserting valid customer...');
    await callUserDataTool('user_data_insert_rows', {
      tableName: 'Customers',
      rows: [{
        id: customerId,
        name: '정상고객',
        shortAddress: '서울시 강남구'
      }]
    });

    const estId = 'EST-1772550953611';
    console.log(`Inserting estimate for fixed customer: ${estId}`);
    await callUserDataTool('user_data_insert_rows', {
      tableName: 'Estimates',
      rows: [{
        id: estId,
        customerId: customerId,
        estimateCode: 'EST-CODE-FIXED',
        status: '상담접수'
      }]
    });

    console.log('Verifying all estimates...');
    const check = await callUserDataTool('user_data_query', { tableName: 'Estimates' });
    console.log('All Estimates:', JSON.stringify(check.rows, null, 2));
    
    console.log('Verifying all customers...');
    const custCheck = await callUserDataTool('user_data_query', { tableName: 'Customers' });
    console.log('All Customers:', JSON.stringify(custCheck.rows, null, 2));
  } catch (error) {
    console.error('Error during force fix:', error.message);
  }
}

forceFix();
