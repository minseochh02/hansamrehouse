import { NextRequest, NextResponse } from 'next/server';
import { executeSQL, insertRows, deleteRows } from '../../../../egdesk-helpers';

export async function GET() {
  try {
    // Joins to get the full process/subProcess context
    // Using the schema structure from scripts/recreate-master-data.ts where names were used as IDs
    const query = `
      SELECT 
        mi.rowid as id,
        mc.name as processName,
        msc.name as subProcessName,
        mi.name as itemName,
        mi.unit as unit
      FROM MasterItems mi
      JOIN MasterSubCategories msc ON mi.subCategoryId = msc.name
      JOIN MasterCategories mc ON msc.categoryId = mc.name
      WHERE mi.isActive = 1
      ORDER BY mc.displayOrder, msc.displayOrder, mi.name
    `;
    
    const result = await executeSQL(query);
    const items = result?.rows || [];
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json([], { status: 500 });
  }
}

function escapeSql(str: string) {
  return str.replace(/'/g, "''");
}

export async function POST(request: NextRequest) {
  try {
    const { processName, subProcessName, itemName, unit } = await request.json();

    if (!processName || !subProcessName || !itemName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const escapedProcess = escapeSql(processName);
    const escapedSubProcess = escapeSql(subProcessName);
    const escapedItem = escapeSql(itemName);
    const escapedUnit = escapeSql(unit || '식');

    // 1. Ensure Category exists
    if (processName) {
      const catExists = await executeSQL(`SELECT name FROM MasterCategories WHERE name = '${escapedProcess}'`);
      if (catExists.rows?.length === 0) {
        const maxOrder = await executeSQL('SELECT MAX(displayOrder) as maxOrder FROM MasterCategories');
        const nextOrder = (maxOrder.rows?.[0]?.maxOrder || 0) + 1;
        
        await insertRows('MasterCategories', [{ name: processName, displayOrder: nextOrder, isActive: 1 }]);
      }
    }

    // 2. Ensure SubCategory exists
    if (subProcessName) {
      const subExists = await executeSQL(`SELECT name FROM MasterSubCategories WHERE name = '${escapedSubProcess}' AND categoryId = '${escapedProcess}'`);
      if (subExists.rows?.length === 0) {
        const maxOrder = await executeSQL(`SELECT MAX(displayOrder) as maxOrder FROM MasterSubCategories WHERE categoryId = '${escapedProcess}'`);
        const nextOrder = (maxOrder.rows?.[0]?.maxOrder || 0) + 1;

        await insertRows('MasterSubCategories', [{ categoryId: processName, name: subProcessName, displayOrder: nextOrder, isActive: 1 }]);
      }
    }

    // 3. Insert Item
    const result = await insertRows('MasterItems', [{ subCategoryId: subProcessName, name: itemName, unit: unit || '식', isActive: 1 }]);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Failed to add item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, processName, subProcessName, itemName, unit } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
    }

    // Fetch existing item to ensure we have all required fields for insertRows (upsert)
    const existingRes = await executeSQL(`SELECT * FROM MasterItems WHERE id = ${id}`);
    const existing = existingRes.rows?.[0];
    
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // If we are updating names, we need to ensure the parent categories exist
    if (processName) {
      await insertRows('MasterCategories', [{ name: processName, displayOrder: 0, isActive: 1 }]);
    }

    if (subProcessName) {
      let catName = processName;
      if (!catName) {
        const res = await executeSQL(`
          SELECT mc.name 
          FROM MasterItems mi 
          JOIN MasterSubCategories msc ON mi.subCategoryId = msc.name 
          JOIN MasterCategories mc ON msc.categoryId = mc.name 
          WHERE mi.id = ${id}
        `);
        catName = res.rows?.[0]?.name;
      }
      
      if (catName) {
        await insertRows('MasterSubCategories', [{ categoryId: catName, name: subProcessName, displayOrder: 0, isActive: 1 }]);
      }
    }

    // Perform upsert using insertRows
    await insertRows('MasterItems', [{
      id: id.toString(),
      subCategoryId: subProcessName || existing.subCategoryId,
      name: itemName || existing.name,
      unit: unit || existing.unit,
      isActive: existing.isActive
    }]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Hard delete for master items is generally fine as estimates have snapshots.
    const safeId = id.toString();
    await deleteRows('MasterItems', { id: safeId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
