import { NextRequest, NextResponse } from 'next/server';
import { executeSQL, deleteRows } from '../../../../egdesk-helpers';

export async function GET() {
  try {
    const categories = await executeSQL('SELECT * FROM MasterCategories WHERE isActive = 1 ORDER BY displayOrder, name');
    return NextResponse.json(categories.rows || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function escapeSql(str: string) {
  return str.replace(/'/g, "''");
}

export async function PATCH(request: NextRequest) {
  try {
    const { oldName, newName } = await request.json();

    if (!oldName || !newName) {
      return NextResponse.json({ error: 'Missing names' }, { status: 400 });
    }

    const escapedOld = escapeSql(oldName);
    const escapedNew = escapeSql(newName);

    // 1. Update SubCategories first
    await executeSQL(`UPDATE MasterSubCategories SET categoryId = '${escapedNew}' WHERE categoryId = '${escapedOld}'`);
    // 2. Update Category name
    await executeSQL(`UPDATE MasterCategories SET name = '${escapedNew}' WHERE name = '${escapedOld}'`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) return NextResponse.json({ error: 'Missing category name' }, { status: 400 });

    const escapedName = escapeSql(name);

    // Cascading logic: 
    // 1. Delete items in subcategories of this category
    const subCategories = await executeSQL(`SELECT name FROM MasterSubCategories WHERE categoryId = '${escapedName}'`);
    const subCategoryNames = (subCategories.rows || []).map((sc: any) => sc.name);
    
    if (subCategoryNames.length > 0) {
      // Since deleteRows might not support IN clause in filters easily depending on implementation,
      // we'll loop or use the tool if it supports arrays. Assuming standard key-value for now.
      for (const scName of subCategoryNames) {
        await deleteRows('MasterItems', { subCategoryId: scName });
      }
    }

    // 2. Delete subcategories
    await deleteRows('MasterSubCategories', { categoryId: name });
    
    // 3. Delete category
    await deleteRows('MasterCategories', { name: name });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
