import { NextRequest, NextResponse } from 'next/server';
import { executeSQL, deleteRows } from '../../../../egdesk-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    
    let query = 'SELECT * FROM MasterSubCategories WHERE isActive = 1';
    if (categoryId) {
      query += ` AND categoryId = '${categoryId}'`;
    }
    query += ' ORDER BY displayOrder, name';
    
    const subcategories = await executeSQL(query);
    return NextResponse.json(subcategories.rows || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function escapeSql(str: string) {
  return str.replace(/'/g, "''");
}

export async function PATCH(request: NextRequest) {
  try {
    const { oldName, newName, categoryId } = await request.json();

    if (!oldName || !newName || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const escapedOld = escapeSql(oldName);
    const escapedNew = escapeSql(newName);
    const escapedCat = escapeSql(categoryId);

    // 1. Update Items first
    await executeSQL(`UPDATE MasterItems SET subCategoryId = '${escapedNew}' WHERE subCategoryId = '${escapedOld}'`);
    // 2. Update SubCategory name
    await executeSQL(`UPDATE MasterSubCategories SET name = '${escapedNew}' WHERE name = '${escapedOld}' AND categoryId = '${escapedCat}'`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const categoryId = searchParams.get('categoryId');

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Missing name or categoryId' }, { status: 400 });
    }

    const escapedName = escapeSql(name);
    const escapedCat = escapeSql(categoryId);

    // 1. Delete items in this subcategory
    await deleteRows('MasterItems', { subCategoryId: name });
    
    // 2. Delete subcategory
    await deleteRows('MasterSubCategories', { name: name, categoryId: categoryId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
