import { NextRequest, NextResponse } from 'next/server';
import { executeSQL, insertRows, deleteRows, updateRows } from '../../../../egdesk-helpers';
import { TABLE_NAMES } from '../../../../egdesk.config';

export async function GET() {
  try {
    const query = `
      SELECT *
      FROM ${TABLE_NAMES.table12}
      WHERE isActive = 1
      ORDER BY name
    `;
    
    const result = await executeSQL(query);
    const vendors = result?.rows || [];
    return NextResponse.json(vendors);
  } catch (error: any) {
    console.error('Failed to fetch vendors:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, name, businessNumber, representative, phone, address, bankName, accountNumber, accountHolder } = data;

    if (!name) {
      return NextResponse.json({ error: 'Missing required fields: name' }, { status: 400 });
    }

    const row: Record<string, any> = {
      id: id || `VEND-${Date.now()}`,
      name,
      businessNumber,
      representative,
      phone,
      address,
      bankName,
      accountNumber,
      accountHolder,
      isActive: 1
    };

    const result = await insertRows(TABLE_NAMES.table12, [row]);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Failed to add vendor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;

    if (!id) {
      return NextResponse.json({ error: 'Missing vendor id' }, { status: 400 });
    }

    if (Object.keys(updates).length > 0) {
      delete updates.createdAt;
      delete updates.updatedAt;
      
      await updateRows(TABLE_NAMES.table12, updates, { filters: { id: id.toString() } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update vendor:', error);
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

    await deleteRows(TABLE_NAMES.table12, { filters: { id: id.toString() } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete vendor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
