import { NextRequest, NextResponse } from 'next/server';
import { executeSQL, insertRows, queryTable } from '../../../../egdesk-helpers';
import { TABLE_NAMES } from '../../../../egdesk.config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    
    if (name) {
      const query = `SELECT * FROM ${TABLE_NAMES.table11} WHERE name LIKE '%${name}%' ORDER BY name`;
      const result = await executeSQL(query);
      return NextResponse.json(result?.rows || []);
    }

    const result = await queryTable(TABLE_NAMES.table11, { orderBy: 'name' });
    return NextResponse.json(result?.rows || []);
  } catch (error: any) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Generate ID if not provided
    const customerId = data.id || `CUST-${Date.now()}`;
    const now = new Date().toISOString();

    const row = {
      ...data,
      id: customerId,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now
    };

    const result = await insertRows(TABLE_NAMES.table11, [row]);

    // Return a flat response
    return NextResponse.json({
      success: true,
      id: customerId,
      result: result?.result || result
    });
  } catch (error: any) {
    console.error('Failed to add customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
