import { NextRequest, NextResponse } from 'next/server';
import { executeSQL, insertRows, queryTable, updateRows, deleteRows, aggregateTable } from '../../../../../egdesk-helpers';
import { TABLE_NAMES } from '../../../../../egdesk.config';

async function ensureMasterData(categoryName: string, subCategoryName: string, itemName: string, unit: string) {
  if (!categoryName) return;

  // 1. Ensure Category
  const catExists = await queryTable(TABLE_NAMES.table4, { filters: { name: categoryName } });
  if (!catExists.rows || catExists.rows.length === 0) {
    const maxOrderRes = await aggregateTable(TABLE_NAMES.table4, 'displayOrder', 'MAX');
    const nextOrder = (Number(maxOrderRes.result) || 0) + 1;
    await insertRows(TABLE_NAMES.table4, [{ name: categoryName, displayOrder: nextOrder, isActive: 1 }]);
  }

  if (!subCategoryName) return;

  // 2. Ensure SubCategory
  const subExists = await queryTable(TABLE_NAMES.table3, { filters: { name: subCategoryName, categoryId: categoryName } });
  if (!subExists.rows || subExists.rows.length === 0) {
    const maxOrderRes = await aggregateTable(TABLE_NAMES.table3, 'displayOrder', 'MAX', { filters: { categoryId: categoryName } });
    const nextOrder = (Number(maxOrderRes.result) || 0) + 1;
    await insertRows(TABLE_NAMES.table3, [{ categoryId: categoryName, name: subCategoryName, displayOrder: nextOrder, isActive: 1 }]);
  }

  if (!itemName) return;

  // 3. Ensure Item
  const itemExists = await queryTable(TABLE_NAMES.table2, { filters: { name: itemName, subCategoryId: subCategoryName } });
  if (!itemExists.rows || itemExists.rows.length === 0) {
    await insertRows(TABLE_NAMES.table2, [{ subCategoryId: subCategoryName, name: itemName, unit: unit || '식', isActive: 1 }]);
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log(`GET Estimate ID: ${id}`);
  try {
    const [estimateRes, schedulesRes, milestonesRes, lineItemsRes, spendingRequestsRes] = await Promise.all([
      queryTable(TABLE_NAMES.table10, { filters: { id } }),
      queryTable(TABLE_NAMES.table9, { filters: { estimateId: id } }),
      queryTable(TABLE_NAMES.table8, { filters: { estimateId: id } }),
      queryTable(TABLE_NAMES.table7, { filters: { estimateId: id } }),
      queryTable(TABLE_NAMES.table6, { filters: { estimateId: id } })
    ]);

    const estimate = estimateRes?.rows?.[0];
    if (!estimate) {
      console.warn(`Estimate not found for ID: ${id}`);
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }

    const customerId = estimate.customerId;
    const customerRes = customerId ? await queryTable(TABLE_NAMES.table11, { filters: { id: customerId } }) : { rows: [] };
    const customer = customerRes?.rows?.[0];
    
    console.log(`Found estimate for customer: ${customer?.name || 'Unknown'}`);

    const schedules = schedulesRes?.rows || [];
    const milestones = milestonesRes?.rows || [];
    const lineItems = lineItemsRes?.rows || [];
    const spendingRequests = spendingRequestsRes?.rows || [];

    const findDate = (type: string) => schedules.find((s: any) => s.type === type)?.date || "";

    const result = {
      id,
      customerName: customer?.name || "",
      shortAddress: customer?.shortAddress || "",
      estimateDate: findDate('ESTIMATE'),
      constructionStartDate: findDate('CONSTRUCTION_START'),
      constructionEndDate: findDate('CONSTRUCTION_END'),
      additionalEstimateDate: findDate('ADDITIONAL_ESTIMATE'),
      additionalConstructionStartDate: findDate('ADDITIONAL_START'),
      additionalConstructionEndDate: findDate('ADDITIONAL_END'),
      moveInCleaningDate: findDate('MOVE_IN_CLEANING'),
      manager: estimate.managerId || "",
      siteManager: estimate.siteManagerId || "",
      estimateCode: estimate.estimateCode,
      estimateStatus: estimate.status,
      siteCode: estimate.siteCode,
      totalAmount: estimate.totalAmount || 0,
      contract: milestones.find((m: any) => m.type === 'contract') || { date: "", percentage: 0, amount: 0 },
      commencement: milestones.find((m: any) => m.type === 'commencement') || { date: "", percentage: 0, amount: 0 },
      midterm: milestones.find((m: any) => m.type === 'midterm') || { date: "", percentage: 0, amount: 0 },
      balance: milestones.find((m: any) => m.type === 'balance') || { date: "", percentage: 0, amount: 0 },
      lineItems: lineItems.filter((li: any) => Number(li.isAdditional) === 0).map((li: any) => ({
        id: li.id,
        category: li.categoryName,
        subCategory: li.subCategoryName,
        name: li.name,
        unit: li.unit,
        quantity: li.quantity,
        materialUnitPrice: li.materialUnitPrice,
        laborUnitPrice: li.laborUnitPrice,
        expenseUnitPrice: li.expenseUnitPrice,
        unitPrice: li.unitPrice,
        amount: li.amount,
        note: li.note
      })),
      additionalLineItems: lineItems.filter((li: any) => Number(li.isAdditional) === 1).map((li: any) => ({
        id: li.id,
        requestDate: li.requestDate,
        location: li.subCategoryName,
        name: li.name,
        materialCost: li.materialUnitPrice,
        laborCost: li.laborUnitPrice,
        expense: li.expenseUnitPrice,
        additionalAmount: li.amount,
        originalAmount: 0,
        totalAmount: li.amount
      })),
      spendingRequests: spendingRequests.map((sr: any) => {
        const materialActual = Number(sr.materialActualCost) || 0;
        const laborActual = Number(sr.laborActualCost) || 0;
        const expenseActual = Number(sr.expenseActualCost) || 0;
        const totalSpendingActual = materialActual + laborActual + expenseActual;

        return {
          id: sr.id,
          lineItemId: sr.lineItemId || "",
          processName: sr.processName || "",
          subProcessName: sr.subProcessName || "",
          itemName: sr.itemName || "",

          // 비용 내역
          materialEstimateCost: Number(sr.materialEstimateCost) || 0,
          materialActualCost: materialActual,
          laborEstimateCost: Number(sr.laborEstimateCost) || 0,
          laborActualCost: laborActual,
          expenseEstimateCost: Number(sr.expenseEstimateCost) || 0,
          expenseActualCost: expenseActual,

          // 기실행 비용
          materialPreviouslySpent: Number(sr.materialPreviouslySpent) || 0,
          laborPreviouslySpent: Number(sr.laborPreviouslySpent) || 0,
          expensePreviouslySpent: Number(sr.expensePreviouslySpent) || 0,

          // 합계
          totalEstimateCost: (Number(sr.materialEstimateCost) || 0) + (Number(sr.laborEstimateCost) || 0) + (Number(sr.expenseEstimateCost) || 0),
          totalSpendingActual,

          // 증빙 정보
          evidenceType: sr.evidenceType || "",
          evidencePhotoUrl: sr.evidencePhotoUrl || "",
          workStatusSheetUrl: sr.workStatusSheetUrl || "",
          evidenceGuide: sr.evidenceText || "",

          // 구매/배송
          isUrgentToday: Boolean(sr.isUrgent),
          deadlineMemo: sr.deadlineMemo || "",
          purchaseLink: sr.purchaseLink || "",
          deliveryType: sr.deliveryType || "",

          // 계좌/정산
          vendorName: sr.vendorName || "",
          isExistingVendorAccount: Boolean(sr.isExistingVendorAccount),
          bankName: sr.bankName || "",
          accountNumber: sr.accountNumber || "",
          accountHolder: sr.accountHolder || "",

          // 3.3% 공제
          amountBeforeTax: Number(sr.amountBeforeTax) || 0,
          hasTaxDeduction: Boolean(sr.hasTaxDeduction),
          taxDeductionAmount: Number(sr.taxDeductionAmount) || 0,
          finalDepositAmount: Number(sr.finalDeposit) || 0,

          // 기타
          memo: sr.memo || "",
          date: sr.date || "",
          contactInfo: sr.contactInfo || "",
          paymentStatus: sr.paymentStatus || "임시저장",
          createdAt: sr.createdAt || new Date().toISOString(),
          updatedAt: sr.updatedAt || new Date().toISOString()
        };
      })
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to get estimate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await request.json();
    const { 
      estimateStatus, manager, siteManager, estimateCode, siteCode, totalAmount,
      estimateDate, constructionStartDate, constructionEndDate, 
      additionalEstimateDate, additionalConstructionStartDate, additionalConstructionEndDate,
      moveInCleaningDate,
      contract, commencement, midterm, balance,
      lineItems, additionalLineItems, spendingRequests
    } = data;

    // 1. Update Estimate Header
    await updateRows(TABLE_NAMES.table10, {
      status: estimateStatus,
      managerId: manager,
      siteManagerId: siteManager,
      estimateCode,
      siteCode,
      totalAmount,
      updatedAt: new Date().toISOString()
    }, { filters: { id } });

    // 2. Update Schedules
    const scheduleItems = [
      { type: 'ESTIMATE', date: estimateDate },
      { type: 'CONSTRUCTION_START', date: constructionStartDate },
      { type: 'CONSTRUCTION_END', date: constructionEndDate },
      { type: 'ADDITIONAL_ESTIMATE', date: additionalEstimateDate },
      { type: 'ADDITIONAL_START', date: additionalConstructionStartDate },
      { type: 'ADDITIONAL_END', date: additionalConstructionEndDate },
      { type: 'MOVE_IN_CLEANING', date: moveInCleaningDate }
    ].filter(i => i.date);

    for (const item of scheduleItems) {
      const existing = await queryTable(TABLE_NAMES.table9, { filters: { estimateId: id, type: item.type } });
      if (existing?.rows?.length > 0) {
        await updateRows(TABLE_NAMES.table9, { date: item.date }, { filters: { estimateId: id, type: item.type } });
      } else {
        await insertRows(TABLE_NAMES.table9, [{ estimateId: id, type: item.type, date: item.date }]);
      }
    }

    // 3. Update Milestones
    const milestoneItems = [
      { type: 'contract', ...contract },
      { type: 'commencement', ...commencement },
      { type: 'midterm', ...midterm },
      { type: 'balance', ...balance }
    ].filter(m => m.date || m.amount);

    for (const item of milestoneItems) {
      const existing = await queryTable(TABLE_NAMES.table8, { filters: { estimateId: id, type: item.type } });
      const milestoneData = { date: item.date, percentage: item.percentage, amount: item.amount };
      if (existing?.rows?.length > 0) {
        await updateRows(TABLE_NAMES.table8, milestoneData, { filters: { estimateId: id, type: item.type } });
      } else {
        await insertRows(TABLE_NAMES.table8, [{ estimateId: id, type: item.type, ...milestoneData }]);
      }
    }

    // 4. Update LineItems (Delete and re-insert for consistency)
    await deleteRows(TABLE_NAMES.table7, { filters: { estimateId: id } });
    
    // Ensure master data for each line item
    for (const li of (lineItems || [])) {
      await ensureMasterData(li.category, li.subCategory, li.name, li.unit);
    }
    for (const li of (additionalLineItems || [])) {
      // For additional items, location is subCategoryName, and category is "추가공사" or similar
      await ensureMasterData("추가공사", li.location, li.name, "");
    }
    
    // Ensure master data for each spending request item if it's new
    for (const sr of (spendingRequests || [])) {
      await ensureMasterData(sr.processName, sr.subProcessName, sr.itemName, "");
    }

    const allLineItems = [
      ...(lineItems || []).map((li: any) => ({
        id: li.id || `LI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        estimateId: id,
        isAdditional: 0,
        categoryName: li.category,
        subCategoryName: li.subCategory,
        name: li.name,
        unit: li.unit || "",
        quantity: li.quantity || 0,
        materialUnitPrice: li.materialUnitPrice || 0,
        laborUnitPrice: li.laborUnitPrice || 0,
        expenseUnitPrice: li.expenseUnitPrice || 0,
        unitPrice: li.unitPrice || 0,
        amount: li.amount || 0,
        note: li.note || ""
      })),
      ...(additionalLineItems || []).map((li: any) => ({
        id: li.id || `ALI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        estimateId: id,
        isAdditional: 1,
        requestDate: li.requestDate || "",
        subCategoryName: li.location || "",
        name: li.name,
        materialUnitPrice: li.materialCost || 0,
        laborUnitPrice: li.laborCost || 0,
        expenseUnitPrice: li.expense || 0,
        unitPrice: (Number(li.materialCost) || 0) + (Number(li.laborCost) || 0) + (Number(li.expense) || 0),
        amount: li.additionalAmount || 0,
        note: ""
      }))
    ];
    if (allLineItems.length > 0) await insertRows(TABLE_NAMES.table7, allLineItems);

    // 5. Update SpendingRequests (Delete and re-insert for consistency)
    await deleteRows(TABLE_NAMES.table6, { filters: { estimateId: id } });
    const allSpending = (spendingRequests || []).map((sr: any) => ({
      id: sr.id || `SR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      estimateId: id,
      lineItemId: sr.lineItemId || "",
      processName: sr.processName || "",
      subProcessName: sr.subProcessName || "",
      itemName: sr.itemName || "",

      // 비용 내역
      materialEstimateCost: sr.materialEstimateCost || 0,
      materialActualCost: sr.materialActualCost || 0,
      laborEstimateCost: sr.laborEstimateCost || 0,
      laborActualCost: sr.laborActualCost || 0,
      expenseEstimateCost: sr.expenseEstimateCost || 0,
      expenseActualCost: sr.expenseActualCost || 0,

      // 기실행 비용
      materialPreviouslySpent: sr.materialPreviouslySpent || 0,
      laborPreviouslySpent: sr.laborPreviouslySpent || 0,
      expensePreviouslySpent: sr.expensePreviouslySpent || 0,

      // 증빙 정보
      evidenceType: sr.evidenceType || "",
      evidencePhotoUrl: sr.evidencePhotoUrl || "",
      workStatusSheetUrl: sr.workStatusSheetUrl || "",
      evidenceText: sr.evidenceGuide || "",

      // 구매/배송
      isUrgent: sr.isUrgentToday ? 1 : 0,
      deadlineMemo: sr.deadlineMemo || "",
      purchaseLink: sr.purchaseLink || "",
      deliveryType: sr.deliveryType || "",
      contactInfo: sr.contactInfo || "",

      // 계좌/정산
      vendorName: sr.vendorName || "",
      isExistingVendorAccount: sr.isExistingVendorAccount ? 1 : 0,
      bankName: sr.bankName || "",
      accountNumber: sr.accountNumber || "",
      accountHolder: sr.accountHolder || "",

      // 3.3% 공제
      amountBeforeTax: sr.amountBeforeTax || 0,
      hasTaxDeduction: sr.hasTaxDeduction ? 1 : 0,
      taxDeductionAmount: sr.taxDeductionAmount || 0,
      finalDeposit: sr.finalDepositAmount || 0,

      // 기타
      memo: sr.memo || "",
      date: sr.date || "",
      paymentStatus: sr.paymentStatus || "임시저장",
      createdAt: sr.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    if (allSpending.length > 0) await insertRows(TABLE_NAMES.table6, allSpending);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update estimate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log(`DELETE Estimate ID: ${id}`);
  try {
    // Delete all related records first to maintain some form of pseudo-integrity
    // (though the DB might not have foreign keys)
    await Promise.all([
      deleteRows(TABLE_NAMES.table9, { filters: { estimateId: id } }), // Schedules
      deleteRows(TABLE_NAMES.table8, { filters: { estimateId: id } }), // Milestones
      deleteRows(TABLE_NAMES.table7, { filters: { estimateId: id } }), // LineItems
      deleteRows(TABLE_NAMES.table6, { filters: { estimateId: id } }), // SpendingRequests
      deleteRows(TABLE_NAMES.table5, { filters: { estimateId: id } }), // Attachments
    ]);

    // Finally delete the estimate header
    await deleteRows(TABLE_NAMES.table10, { filters: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete estimate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
