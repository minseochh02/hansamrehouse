import { NextRequest, NextResponse } from 'next/server';
import { executeSQL, insertRows, deleteRows, queryTable, aggregateTable, updateRows } from '../../../../egdesk-helpers';
import { TABLE_NAMES } from '../../../../egdesk.config';

export async function GET() {
  try {
    // Fetch all required tables to join in memory, avoiding executeSQL restrictions
    const [itemsRes, subCategoriesRes, categoriesRes] = await Promise.all([
      queryTable(TABLE_NAMES.table2, { filters: { isActive: '1' } }),
      queryTable(TABLE_NAMES.table3, { filters: { isActive: '1' } }),
      queryTable(TABLE_NAMES.table4, { filters: { isActive: '1' } })
    ]);

    const items = itemsRes?.rows || [];
    const subCategories = subCategoriesRes?.rows || [];
    const categories = categoriesRes?.rows || [];

    // Map data together
    const result = items.map((mi: any) => {
      const msc = subCategories.find((sc: any) => sc.name === mi.subCategoryId);
      const mc = categories.find((c: any) => c.name === msc?.categoryId);

      return {
        id: mi.id,
        processName: mc?.name || "",
        subProcessName: msc?.name || "",
        itemName: mi.name,
        unit: mi.unit
      };
    });
    
    // Sort by categories displayOrder, then subCategories displayOrder, then name
    result.sort((a: any, b: any) => {
      const catA = categories.find(c => c.name === a.processName);
      const catB = categories.find(c => c.name === b.processName);
      if ((catA?.displayOrder || 0) !== (catB?.displayOrder || 0)) {
        return (catA?.displayOrder || 0) - (catB?.displayOrder || 0);
      }
      
      const subA = subCategories.find(s => s.name === a.subProcessName);
      const subB = subCategories.find(s => s.name === b.subProcessName);
      if ((subA?.displayOrder || 0) !== (subB?.displayOrder || 0)) {
        return (subA?.displayOrder || 0) - (subB?.displayOrder || 0);
      }
      
      return a.itemName.localeCompare(b.itemName);
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { processName, subProcessName, itemName, unit } = await request.json();

    if (!processName || !subProcessName || !itemName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Ensure Category exists
    if (processName) {
      const catExists = await queryTable(TABLE_NAMES.table4, { filters: { name: processName } });
      if (catExists.rows?.length === 0) {
        const maxOrderRes = await aggregateTable(TABLE_NAMES.table4, 'displayOrder', 'MAX');
        const nextOrder = (Number(maxOrderRes.result) || 0) + 1;
        
        await insertRows(TABLE_NAMES.table4, [{ name: processName, displayOrder: nextOrder, isActive: 1 }]);
      }
    }

    // 2. Ensure SubCategory exists
    if (subProcessName) {
      const subExists = await queryTable(TABLE_NAMES.table3, { filters: { name: subProcessName, categoryId: processName } });
      if (subExists.rows?.length === 0) {
        const maxOrderRes = await aggregateTable(TABLE_NAMES.table3, 'displayOrder', 'MAX', { filters: { categoryId: processName } });
        const nextOrder = (Number(maxOrderRes.result) || 0) + 1;

        await insertRows(TABLE_NAMES.table3, [{ categoryId: processName, name: subProcessName, displayOrder: nextOrder, isActive: 1 }]);
      }
    }

    // 3. Insert Item
    const result = await insertRows(TABLE_NAMES.table2, [{ subCategoryId: subProcessName, name: itemName, unit: unit || '식', isActive: 1 }]);

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

    // Fetch existing item
    const existingRes = await queryTable(TABLE_NAMES.table2, { filters: { id: id.toString() } });
    const existing = existingRes.rows?.[0];
    
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // If we are updating names, we need to ensure the parent categories exist
    if (processName) {
      await insertRows(TABLE_NAMES.table4, [{ name: processName, displayOrder: 0, isActive: 1 }]);
    }

    if (subProcessName) {
      let catName = processName;
      if (!catName) {
        const itemRes = await queryTable(TABLE_NAMES.table2, { filters: { id: id.toString() } });
        const subCatName = itemRes.rows?.[0]?.subCategoryId;
        if (subCatName) {
          const subCatRes = await queryTable(TABLE_NAMES.table3, { filters: { name: subCatName } });
          catName = subCatRes.rows?.[0]?.categoryId;
        }
      }
      
      if (catName) {
        await insertRows(TABLE_NAMES.table3, [{ categoryId: catName, name: subProcessName, displayOrder: 0, isActive: 1 }]);
      }
    }

    // Perform update using updateRows
    const updates: Record<string, any> = {};
    if (subProcessName) updates.subCategoryId = subProcessName;
    if (itemName) updates.name = itemName;
    if (unit) updates.unit = unit;

    if (Object.keys(updates).length > 0) {
      await updateRows(TABLE_NAMES.table2, updates, { filters: { id: id.toString() } });
    }

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

    await deleteRows(TABLE_NAMES.table2, { filters: { id: id.toString() } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
