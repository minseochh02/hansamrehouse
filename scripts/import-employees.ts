import fs from 'fs';
import path from 'path';

const API_KEY = '027901a3-c678-4fa0-8d3c-2532d961c001';
const API_URL = 'http://localhost:8080/user-data/tools/call';

async function callUserDataTool(toolName: string, args: any) {
  const body = JSON.stringify({ tool: toolName, arguments: args });
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
    },
    body,
  });

  const result = await response.json() as any;
  if (!result.success) {
    throw new Error(result.error || 'Tool call failed');
  }
  return result;
}

function parseCSV(content: string) {
  const lines = content.split('\n');
  const result: any[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parser that handles quotes
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());
    
    if (parts.length >= 11) {
      result.push({
        name: parts[0],
        dept: parts[1],
        role: parts[2],
        employeeId: parts[3],
        joinDate: parts[4],
        resignDate: parts[5],
        note: parts[6],
        type: parts[7],
        email: parts[8],
        level: parts[9],
        password: parts[10]
      });
    }
  }
  return result;
}

async function main() {
  const csvPath = path.join(process.cwd(), '한샘리하우스_ERP_개발 - 사원DB.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  console.log(`Processing ${rows.length} employees...`);

  const employees = rows.map(row => ({
    id: row.employeeId, // Use 사원번호 as natural ID
    name: row.name,
    role: `${row.dept} ${row.role}`,
    email: row.email,
    isActive: row.resignDate ? 0 : 1,
    // Add other fields as nulls to match schema
    phone: null,
    bankName: null,
    accountNumber: null,
    accountHolder: null
  }));

  // Recreate Employees table to ensure schema matches natural ID preference
  // First delete if exists
  try {
    await callUserDataTool('user_data_delete_table', { tableName: 'Employees' });
    console.log('Deleted existing Employees table.');
  } catch (e) {
    console.log('Employees table not found.');
  }

  // Create table
  await callUserDataTool('user_data_create_table', {
    displayName: 'Employees',
    tableName: 'Employees',
    schema: [
      { name: 'name', type: 'TEXT', notNull: true },
      { name: 'phone', type: 'TEXT' },
      { name: 'email', type: 'TEXT' },
      { name: 'role', type: 'TEXT' },
      { name: 'bankName', type: 'TEXT' },
      { name: 'accountNumber', type: 'TEXT' },
      { name: 'accountHolder', type: 'TEXT' },
      { name: 'isActive', type: 'INTEGER', defaultValue: 1 }
    ],
    uniqueKeyColumns: ['id'], // Using the system's hidden id for 사원번호
    description: 'Imported from 사원DB.csv'
  });
  console.log('Created Employees table.');

  // Note: user_data_insert_rows expects an 'id' if we want to set it manually, 
  // but EGDesk usually auto-generates a UUID. 
  // Let's try to pass 'id' explicitly.
  
  const CHUNK_SIZE = 20;
  for (let i = 0; i < employees.length; i += CHUNK_SIZE) {
    const chunk = employees.slice(i, i + CHUNK_SIZE);
    await callUserDataTool('user_data_insert_rows', { 
      tableName: 'Employees', 
      rows: chunk 
    });
    console.log(`Imported ${Math.min(i + CHUNK_SIZE, employees.length)} / ${employees.length} employees...`);
  }

  console.log('Employee import completed successfully!');
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
