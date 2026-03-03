/**
 * Add missing columns to SpendingRequests table
 */

const https = require('http');

const EGDESK_API_URL = 'http://localhost:8080';
const EGDESK_API_KEY = 'dbd74264-3254-43b6-9e0a-d714732f5083';

async function callMCP(tool, args) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ tool, arguments: args });
    const url = new URL('/user-data/tools/call', EGDESK_API_URL);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-Api-Key': EGDESK_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (!result.success) {
            reject(new Error(result.error || 'Tool call failed'));
          } else {
            const content = result.result?.content?.[0]?.text;
            resolve(content ? JSON.parse(content) : null);
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function addMissingColumns() {
  console.log('Adding missing columns to SpendingRequests table...');

  const alterQueries = [
    `ALTER TABLE SpendingRequests ADD COLUMN subProcessName TEXT`,
    `ALTER TABLE SpendingRequests ADD COLUMN materialEstimateCost REAL DEFAULT 0`,
    `ALTER TABLE SpendingRequests ADD COLUMN laborEstimateCost REAL DEFAULT 0`,
    `ALTER TABLE SpendingRequests ADD COLUMN expenseEstimateCost REAL DEFAULT 0`,
    `ALTER TABLE SpendingRequests ADD COLUMN materialPreviouslySpent REAL DEFAULT 0`,
    `ALTER TABLE SpendingRequests ADD COLUMN laborPreviouslySpent REAL DEFAULT 0`,
    `ALTER TABLE SpendingRequests ADD COLUMN expensePreviouslySpent REAL DEFAULT 0`,
    `ALTER TABLE SpendingRequests ADD COLUMN evidencePhotoUrl TEXT`,
    `ALTER TABLE SpendingRequests ADD COLUMN workStatusSheetUrl TEXT`,
    `ALTER TABLE SpendingRequests ADD COLUMN vendorName TEXT`,
    `ALTER TABLE SpendingRequests ADD COLUMN isExistingVendorAccount INTEGER DEFAULT 0`,
    `ALTER TABLE SpendingRequests ADD COLUMN amountBeforeTax REAL DEFAULT 0`,
    `ALTER TABLE SpendingRequests ADD COLUMN taxDeductionAmount REAL DEFAULT 0`
  ];

  for (const query of alterQueries) {
    try {
      console.log(`Executing: ${query}`);
      await callMCP('user_data_sql_query', { query });
      console.log('✓ Success');
    } catch (err) {
      // Column might already exist, that's okay
      console.log(`⚠ ${err.message}`);
    }
  }

  console.log('\n✅ Schema update complete!');
}

addMissingColumns().catch(console.error);
