import fs from 'fs';
import path from 'path';

const API_KEY = '35813a42-b8aa-4d0a-a3eb-e16833652f2c';
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json() as any;
  if (!result.success) {
    throw new Error(result.error || 'Tool call failed');
  }
  return result;
}

// Simple CSV parser for this specific format
function parseCSV(content: string) {
  const lines = content.split('\n');
  const result: any[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle quoted values with commas
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
    
    if (parts.length >= 7) {
      result.push({
        categoryCode: parts[0],
        categoryName: parts[1],
        subCategoryCode: parts[2],
        subCategoryName: parts[3],
        itemCode: parts[4],
        itemName: parts[5],
        unit: parts[6],
      });
    }
  }
  return result;
}

async function main() {
  const csvPath = path.join(process.cwd(), '한샘리하우스_ERP_개발 - 품목DB.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  const categories = new Map<string, any>();
  const subCategories = new Map<string, any>();
  const items: any[] = [];

  for (const row of rows) {
    if (!categories.has(row.categoryCode)) {
      categories.set(row.categoryCode, { id: row.categoryCode, name: row.categoryName, displayOrder: 0, isActive: 1 });
    }
    if (!subCategories.has(row.subCategoryCode)) {
      subCategories.set(row.subCategoryCode, { id: row.subCategoryCode, categoryId: row.categoryCode, name: row.subCategoryName, displayOrder: 0, isActive: 1 });
    }
    items.push({
      id: row.itemCode,
      subCategoryId: row.subCategoryCode,
      name: row.itemName,
      unit: row.unit,
      isActive: 1
    });
  }

  console.log(`Processing ${categories.size} categories, ${subCategories.size} sub-categories, and ${items.length} items...`);

  // DELETE ALL rows first to avoid duplicates or empty IDs if necessary
  console.log('Clearing existing master data...');
  // The API doesn't have a truncate tool, and user_data_sql_query is SELECT-only.
  // However, user_data_insert_rows might handle updates/replaces if unique keys are set.

  // Insert Categories
  console.log('Inserting categories...');
  const catRows = Array.from(categories.values());
  for (let i = 0; i < catRows.length; i += 10) {
    const res = await callUserDataTool('user_data_insert_rows', { 
      tableName: 'MasterCategories', 
      rows: catRows.slice(i, i + 10)
    });
    console.log(`Inserted categories ${i + 1}-${Math.min(i + 10, catRows.length)}: ${JSON.stringify(res).substring(0, 100)}...`);
  }

  // Insert Sub-categories
  console.log('Inserting sub-categories...');
  const subRows = Array.from(subCategories.values());
  for (let i = 0; i < subRows.length; i += 10) {
    const res = await callUserDataTool('user_data_insert_rows', { 
      tableName: 'MasterSubCategories', 
      rows: subRows.slice(i, i + 10)
    });
    console.log(`Inserted sub-categories ${i + 1}-${Math.min(i + 10, subRows.length)}: ${JSON.stringify(res).substring(0, 100)}...`);
  }

  // Insert Items in chunks
  const CHUNK_SIZE = 10;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const res = await callUserDataTool('user_data_insert_rows', { 
      tableName: 'MasterItems', 
      rows: chunk 
    });
    console.log(`Imported ${Math.min(i + CHUNK_SIZE, items.length)} / ${items.length} items... res: ${JSON.stringify(res).substring(0, 100)}...`);
  }

  console.log('Import completed successfully!');
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
