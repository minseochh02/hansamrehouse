import { NextRequest, NextResponse } from 'next/server';
import { executeSQL, insertRows, deleteRows, queryTable, updateRows } from '../../../../egdesk-helpers';
import { TABLE_NAMES } from '../../../../egdesk.config';

export async function GET() {
  try {
    const query = `
      SELECT *
      FROM ${TABLE_NAMES.table1}
      WHERE isActive = 1
      ORDER BY name
    `;
    
    const result = await executeSQL(query);
    const employees = result?.rows || [];
    return NextResponse.json(employees);
  } catch (error: any) {
    console.error('Failed to fetch employees:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, name, phone, email, role, bankName, accountNumber, accountHolder } = data;

    if (!name) {
      return NextResponse.json({ error: 'Missing required fields: name' }, { status: 400 });
    }

    const row: Record<string, any> = {
      id: id || `EMP-${Date.now()}`,
      name,
      phone,
      email,
      role,
      bankName,
      accountNumber,
      accountHolder,
      isActive: 1
    };

    const result = await insertRows(TABLE_NAMES.table1, [row]);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Failed to add employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;

    if (!id) {
      return NextResponse.json({ error: 'Missing employee id' }, { status: 400 });
    }

    if (Object.keys(updates).length > 0) {
      // Remove createdAt/updatedAt if present, to let the DB handles it
      delete updates.createdAt;
      delete updates.updatedAt;
      
      await updateRows(TABLE_NAMES.table1, updates, { filters: { id: id.toString() } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update employee:', error);
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

    // Hard delete
    await deleteRows(TABLE_NAMES.table1, { filters: { id: id.toString() } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
