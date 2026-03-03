import { NextRequest, NextResponse } from 'next/server';
import { executeSQL, insertRows, queryTable } from '../../../../egdesk-helpers';
import { TABLE_NAMES } from '../../../../egdesk.config';

export async function GET() {
  try {
    // Fetch all required tables to join in memory, avoiding executeSQL restrictions
    const [estimatesRes, customersRes, employeesRes, schedulesRes] = await Promise.all([
      queryTable(TABLE_NAMES.table10),
      queryTable(TABLE_NAMES.table11),
      queryTable(TABLE_NAMES.table1),
      queryTable(TABLE_NAMES.table9)
    ]);

    const estimates = estimatesRes?.rows || [];
    const customers = customersRes?.rows || [];
    const employees = employeesRes?.rows || [];
    const schedules = schedulesRes?.rows || [];

    // Map data together
    const result = estimates.map((e: any) => {
      const customer = customers.find((c: any) => c.id === e.customerId);
      const manager = employees.find((emp: any) => emp.id === e.managerId);
      
      const estimateSchedules = schedules.filter((s: any) => s.estimateId === e.id);
      const findDate = (type: string) => estimateSchedules.find((s: any) => s.type === type)?.date || "";

      return {
        ...e,
        customerName: customer?.name || "",
        shortAddress: customer?.shortAddress || "",
        estimateDate: findDate('ESTIMATE'),
        constructionStartDate: findDate('CONSTRUCTION_START'),
        constructionEndDate: findDate('CONSTRUCTION_END'),
        manager: manager?.name || ""
      };
    });
    
    // Sort by ID descending as a fallback for createdAt
    result.sort((a: any, b: any) => b.id.localeCompare(a.id));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to fetch estimates:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerId, estimateCode, siteCode, managerId, status } = await request.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    // 1. Create Estimate
    const estId = `EST-${Date.now()}`;
    const estCode = estimateCode || `EST-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000)}`;
    
    console.log(`Creating Estimate: ${estId} for Customer: ${customerId}`);
    
    await insertRows(TABLE_NAMES.table10, [{
      id: estId,
      customerId,
      estimateCode: estCode,
      siteCode: siteCode || '',
      managerId: managerId || '',
      status: status || '상담접수',
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]);

    // 2. Initial Schedule (Estimate date = today)
    await insertRows(TABLE_NAMES.table9, [{
      estimateId: estId,
      type: 'ESTIMATE',
      date: new Date().toISOString().slice(0, 10),
      note: '자동 생성'
    }]);

    return NextResponse.json({ success: true, id: estId });
  } catch (error: any) {
    console.error('Failed to create estimate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
