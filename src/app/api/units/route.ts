import { NextResponse } from 'next/server';
import { executeSQL } from '../../../../egdesk-helpers';

export async function GET() {
  try {
    const query = `
      SELECT DISTINCT unit 
      FROM MasterItems 
      WHERE unit IS NOT NULL AND unit != ''
      ORDER BY unit ASC
    `;
    
    const result = await executeSQL(query);
    const units = (result?.rows || []).map((row: any) => row.unit);
    return NextResponse.json(units);
  } catch (error: any) {
    console.error('Failed to fetch units:', error);
    return NextResponse.json([], { status: 500 });
  }
}
