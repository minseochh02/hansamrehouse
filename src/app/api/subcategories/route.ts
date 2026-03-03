import { NextRequest, NextResponse } from 'next/server';
import { deleteRows, queryTable, updateRows } from '../../../../egdesk-helpers';
import { TABLE_NAMES } from '../../../../egdesk.config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    
    const filters: Record<string, string> = { isActive: '1' };
    if (categoryId) {
      filters.categoryId = categoryId;
    }
    
    const subcategories = await queryTable(TABLE_NAMES.table3, {
      filters,
      orderBy: 'displayOrder',
      orderDirection: 'ASC'
    });
    
    return NextResponse.json(subcategories.rows || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { oldName, newName, categoryId } = await request.json();

    if (!oldName || !newName || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update Items first
    await updateRows(TABLE_NAMES.table2, 
      { subCategoryId: newName }, 
      { filters: { subCategoryId: oldName } }
    );
    
    // 2. Update SubCategory name
    await updateRows(TABLE_NAMES.table3, 
      { name: newName }, 
      { filters: { name: oldName, categoryId: categoryId } }
    );

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

    // 1. Delete items in this subcategory
    await deleteRows(TABLE_NAMES.table2, { filters: { subCategoryId: name } });
    
    // 2. Delete subcategory
    await deleteRows(TABLE_NAMES.table3, { filters: { name: name, categoryId: categoryId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
