import { NextRequest, NextResponse } from 'next/server';
import { deleteRows, queryTable, updateRows, aggregateTable } from '../../../../egdesk-helpers';
import { TABLE_NAMES } from '../../../../egdesk.config';

export async function GET() {
  try {
    const categories = await queryTable(TABLE_NAMES.table4, {
      filters: { isActive: '1' },
      orderBy: 'displayOrder',
      orderDirection: 'ASC'
    });
    return NextResponse.json(categories.rows || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { oldName, newName } = await request.json();

    if (!oldName || !newName) {
      return NextResponse.json({ error: 'Missing names' }, { status: 400 });
    }

    // 1. Update SubCategories first
    await updateRows(TABLE_NAMES.table3, 
      { categoryId: newName }, 
      { filters: { categoryId: oldName } }
    );
    
    // 2. Update Category name
    await updateRows(TABLE_NAMES.table4, 
      { name: newName }, 
      { filters: { name: oldName } }
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

    if (!name) return NextResponse.json({ error: 'Missing category name' }, { status: 400 });

    // Cascading logic: 
    // 1. Delete items in subcategories of this category
    const subCategories = await queryTable(TABLE_NAMES.table3, {
      filters: { categoryId: name }
    });
    const subCategoryNames = (subCategories.rows || []).map((sc: any) => sc.name);
    
    if (subCategoryNames.length > 0) {
      for (const scName of subCategoryNames) {
        await deleteRows(TABLE_NAMES.table2, { filters: { subCategoryId: scName } });
      }
    }

    // 2. Delete subcategories
    await deleteRows(TABLE_NAMES.table3, { filters: { categoryId: name } });
    
    // 3. Delete category
    await deleteRows(TABLE_NAMES.table4, { filters: { name: name } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
