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
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) { parts.push(current.trim()); current = ''; }
      else current += char;
    }
    parts.push(current.trim());
    if (parts.length >= 7) {
      result.push({
        categoryName: parts[1],
        subCategoryName: parts[3],
        itemName: parts[5],
        unit: parts[6]
      });
    }
  }
  return result;
}

async function main() {
  const tablesToDelete = ['MasterItems', 'MasterSubCategories', 'MasterCategories'];
  console.log('Cleaning up existing tables...');
  for (const table of tablesToDelete) {
    try {
      await callUserDataTool('user_data_delete_table', { tableName: table });
      console.log(`Deleted table: ${table}`);
    } catch (e) {
      console.log(`Table ${table} not found or could not be deleted.`);
    }
  }

  console.log('Recreating tables with name-based schema...');

  // Create MasterCategories
  await callUserDataTool('user_data_create_table', {
    displayName: 'MasterCategories',
    tableName: 'MasterCategories',
    schema: [
      { name: 'name', type: 'TEXT', notNull: true },
      { name: 'displayOrder', type: 'INTEGER', defaultValue: 0 },
      { name: 'isActive', type: 'INTEGER', defaultValue: 1 }
    ],
    uniqueKeyColumns: ['name'],
    duplicateAction: 'update'
  });
  console.log('Created MasterCategories.');

  // Create MasterSubCategories
  await callUserDataTool('user_data_create_table', {
    displayName: 'MasterSubCategories',
    tableName: 'MasterSubCategories',
    schema: [
      { name: 'categoryId', type: 'TEXT', notNull: true },
      { name: 'name', type: 'TEXT', notNull: true },
      { name: 'displayOrder', type: 'INTEGER', defaultValue: 0 },
      { name: 'isActive', type: 'INTEGER', defaultValue: 1 }
    ],
    uniqueKeyColumns: ['name', 'categoryId'],
    duplicateAction: 'update'
  });
  console.log('Created MasterSubCategories.');

  // Create MasterItems
  await callUserDataTool('user_data_create_table', {
    displayName: 'MasterItems',
    tableName: 'MasterItems',
    schema: [
      { name: 'subCategoryId', type: 'TEXT', notNull: true },
      { name: 'name', type: 'TEXT', notNull: true },
      { name: 'unit', type: 'TEXT' },
      { name: 'isActive', type: 'INTEGER', defaultValue: 1 }
    ],
    uniqueKeyColumns: ['name', 'subCategoryId'],
    duplicateAction: 'update'
  });
  console.log('Created MasterItems.');

  const csvPath = path.join(process.cwd(), '한샘리하우스_ERP_개발 - 품목DB.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  const categories = new Map<string, any>();
  const subCategories = new Map<string, any>();
  const items: any[] = [];

  let categoryCounter = 0;
  let subCategoryCounter = 0;

  for (const row of rows) {
    if (!categories.has(row.categoryName)) {
      categories.set(row.categoryName, { 
        name: row.categoryName, 
        displayOrder: categoryCounter++, 
        isActive: 1 
      });
    }
    const subKey = `${row.categoryName}|${row.subCategoryName}`;
    if (!subCategories.has(subKey)) {
      subCategories.set(subKey, { 
        categoryId: row.categoryName, 
        name: row.subCategoryName, 
        displayOrder: subCategoryCounter++, 
        isActive: 1 
      });
    }
    items.push({
      subCategoryId: row.subCategoryName,
      name: row.itemName,
      unit: row.unit,
      isActive: 1
    });
  }

  console.log(`Importing ${categories.size} categories...`);
  await callUserDataTool('user_data_insert_rows', { tableName: 'MasterCategories', rows: Array.from(categories.values()) });

  console.log(`Importing ${subCategories.size} sub-categories...`);
  const subRows = Array.from(subCategories.values());
  for (let i = 0; i < subRows.length; i += 20) {
    await callUserDataTool('user_data_insert_rows', { tableName: 'MasterSubCategories', rows: subRows.slice(i, i + 20) });
  }

  console.log(`Importing ${items.length} items...`);
  for (let i = 0; i < items.length; i += 50) {
    await callUserDataTool('user_data_insert_rows', { tableName: 'MasterItems', rows: items.slice(i, i + 50) });
    console.log(`Imported ${Math.min(i + 50, items.length)} / ${items.length} items...`);
  }

  console.log('Re-import completed successfully using names as natural IDs!');
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
