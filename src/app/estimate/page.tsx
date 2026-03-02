"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type {
  Estimate,
  EstimateStatus,
  EstimateLineItem,
  PaymentMilestone,
  AdditionalLineItem,
  SpendingRequestItem,
  SpendingFilter,
} from "@/types/estimate";
import { STATUS_STYLES } from "@/components/estimate/constants";
import { StatusBadge } from "@/components/estimate/StatusBadge";
import { SectionCard } from "@/components/estimate/SectionCard";
import { Field } from "@/components/estimate/Field";
import { PaymentTimeline } from "@/components/estimate/PaymentTimeline";
import { LineItemTable } from "@/components/estimate/LineItemTable";
import { LineItemTableCompact } from "@/components/estimate/LineItemTableCompact";
import { AdditionalItemTable } from "@/components/estimate/AdditionalItemTable";
import { SpendingRequestTable } from "@/components/estimate/SpendingRequestTable";
import { ChevronIcon } from "@/components/estimate/ChevronIcon";

const MOCK_ESTIMATE: Estimate = {
  customerName: "홍길동",
  shortAddress: "한남 더힐 302호",
  estimateDate: "2024-03-01",
  constructionStartDate: "2024-04-01",
  constructionEndDate: "2024-06-30",
  additionalEstimateDate: "",
  additionalConstructionStartDate: "",
  additionalConstructionEndDate: "",
  manager: "김한샘",
  siteManager: "박현장",
  estimateCode: "EST-2024-001",
  estimateStatus: "견적중",
  siteCode: "SITE-HN-302",
  totalAmount: 45000000,
  contract: { date: "2024-03-15", percentage: 30, amount: 13500000 },
  commencement: { date: "2024-04-01", percentage: 30, amount: 13500000 },
  midterm: { date: "2024-05-15", percentage: 30, amount: 13500000 },
  moveInCleaningDate: "2024-06-28",
  balance: { date: "2024-06-30", percentage: 10, amount: 4500000 },
  lineItems: [
    { id: "1", category: "철거", subCategory: "주방", name: "기존 주방 철거", unit: "식", quantity: 1, materialUnitPrice: 0, laborUnitPrice: 800000, expenseUnitPrice: 0, unitPrice: 800000, amount: 800000, note: "" },
    { id: "2", category: "철거", subCategory: "욕실", name: "기존 욕실 철거", unit: "식", quantity: 2, materialUnitPrice: 0, laborUnitPrice: 600000, expenseUnitPrice: 0, unitPrice: 600000, amount: 1200000, note: "욕실 2개" },
    { id: "3", category: "목공", subCategory: "주방", name: "주방 상부장", unit: "M", quantity: 4.5, materialUnitPrice: 350000, laborUnitPrice: 0, expenseUnitPrice: 0, unitPrice: 350000, amount: 1575000, note: "" },
    { id: "4", category: "목공", subCategory: "주방", name: "주방 하부장", unit: "M", quantity: 3.2, materialUnitPrice: 400000, laborUnitPrice: 0, expenseUnitPrice: 0, unitPrice: 400000, amount: 1280000, note: "" },
    { id: "5", category: "타일", subCategory: "주방", name: "주방 벽 타일", unit: "㎡", quantity: 12, materialUnitPrice: 85000, laborUnitPrice: 0, expenseUnitPrice: 0, unitPrice: 85000, amount: 1020000, note: "" },
    { id: "6", category: "타일", subCategory: "욕실", name: "욕실 바닥 타일", unit: "㎡", quantity: 8, materialUnitPrice: 95000, laborUnitPrice: 0, expenseUnitPrice: 0, unitPrice: 95000, amount: 760000, note: "" },
    { id: "7", category: "도장", subCategory: "거실", name: "거실 벽면 도장", unit: "㎡", quantity: 85, materialUnitPrice: 12000, laborUnitPrice: 0, expenseUnitPrice: 0, unitPrice: 12000, amount: 1020000, note: "" },
    { id: "8", category: "설비", subCategory: "주방", name: "26평 공용부 융 스위치, 콘센트 교체 자재비(인건비 별도)// 듀로 플라스틱 매트화이트 기준-100", unit: "식", quantity: 1, materialUnitPrice: 500000, laborUnitPrice: 1000000, expenseUnitPrice: 0, unitPrice: 1500000, amount: 1500000, note: "" },
    { id: "9", category: "전기", subCategory: "전체", name: "조명 교체", unit: "EA", quantity: 15, materialUnitPrice: 45000, laborUnitPrice: 0, expenseUnitPrice: 0, unitPrice: 45000, amount: 675000, note: "거실+주방" },
    { id: "10", category: "공사준비", subCategory: "공사준비", name: "공사 동의서(공사 동의율 40% 기준)", unit: "식", quantity: 1, materialUnitPrice: 0, laborUnitPrice: 0, expenseUnitPrice: 100000, unitPrice: 100000, amount: 100000, note: "" },
    { id: "11", category: "공사준비", subCategory: "공사준비", name: "공사 동의서(공사 동의율 60% 기준)", unit: "식", quantity: 1, materialUnitPrice: 0, laborUnitPrice: 0, expenseUnitPrice: 150000, unitPrice: 150000, amount: 150000, note: "" },
  ],
  additionalLineItems: [],
  spendingRequests: [],
};

export default function EstimatePage() {
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [rightPanelMode, setRightPanelMode] = useState<"none" | "additional" | "spending">("none");
  const [estimate, setEstimate] = useState<Estimate>(MOCK_ESTIMATE);
  const [spendingFilter, setSpendingFilter] = useState<SpendingFilter>({ type: "none", value: "" });

  // Spending Request Drawer State
  const [isSpendingDrawerOpen, setIsSpendingDrawerOpen] = useState(false);
  const [editingSpendingRequest, setEditingSpendingRequest] = useState<SpendingRequestItem | null>(null);

  const handleOpenSpendingDrawer = (item: SpendingRequestItem | null = null) => {
    setEditingSpendingRequest(item);
    setIsSpendingDrawerOpen(true);
    setRightPanelMode("spending"); // Ensure spending panel is open
  };

  const handleMapLineItemToSpending = (lineItem: EstimateLineItem) => {
    const now = new Date().toISOString().split('T')[0];
    
    // Calculate previously spent amounts for this line item
    const otherRequests = estimate.spendingRequests.filter(req => req.lineItemId === lineItem.id);
    const matPrev = otherRequests.reduce((sum, req) => sum + (req.materialActualCost || 0), 0);
    const labPrev = otherRequests.reduce((sum, req) => sum + (req.laborActualCost || 0), 0);
    const expPrev = otherRequests.reduce((sum, req) => sum + (req.expenseActualCost || 0), 0);

    const matEst = lineItem.materialUnitPrice * lineItem.quantity;
    const labEst = lineItem.laborUnitPrice * lineItem.quantity;
    const expEst = lineItem.expenseUnitPrice * lineItem.quantity;

    const newItem: Omit<SpendingRequestItem, "id"> = {
      lineItemId: lineItem.id,
      processName: lineItem.category,
      subProcessName: lineItem.subCategory,
      itemName: lineItem.name,
      status: "최초",
      materialEstimateCost: matEst,
      materialActualCost: 0,
      laborEstimateCost: labEst,
      laborActualCost: 0,
      expenseEstimateCost: expEst,
      expenseActualCost: 0,
      materialPreviouslySpent: matPrev,
      laborPreviouslySpent: labPrev,
      expensePreviouslySpent: expPrev,
      totalEstimateCost: lineItem.amount,
      totalSpendingActual: 0,
      evidenceType: "",
      evidencePhotoUrl: "",
      workStatusSheetUrl: "",
      evidenceGuide: "",
      isUrgentToday: false,
      deadlineMemo: "",
      purchaseLink: "",
      deliveryType: "",
      vendorName: "",
      isExistingVendorAccount: false,
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      amountBeforeTax: 0,
      hasTaxDeduction: false,
      taxDeductionAmount: 0,
      finalDepositAmount: 0,
      memo: "",
      date: now,
      contactInfo: "",
      paymentStatus: "대기",
      createdAt: now,
      updatedAt: now,
    };
    setEditingSpendingRequest(newItem as SpendingRequestItem); // Temporary cast, id will be added on save
    setIsSpendingDrawerOpen(true);
    setRightPanelMode("spending");
  };

  const isSplitView = rightPanelMode !== "none";

  // Automatically close right panels if status changes and they are no longer allowed
  useEffect(() => {
    if (rightPanelMode === "additional") {
      const allowed = (["공사중", "공사완료", "추가공사중", "추가공사완료"] as EstimateStatus[]).includes(estimate.estimateStatus);
      if (!allowed) setRightPanelMode("none");
    }
    if (rightPanelMode === "spending") {
      const allowed = (["견적중", "계약완료", "공사중", "추가공사중"] as EstimateStatus[]).includes(estimate.estimateStatus);
      if (!allowed) setRightPanelMode("none");
    }
  }, [estimate.estimateStatus, rightPanelMode]);

  const updateField = (field: keyof Estimate, value: any) => {
    setEstimate((prev) => {
      const newState = { ...prev, [field]: value };
      
      // If totalAmount is updated, update all milestone amounts
      if (field === "totalAmount") {
        const updateMilestoneAmounts = (milestone: PaymentMilestone) => ({
          ...milestone,
          amount: Math.round(Number(value) * (milestone.percentage / 100)),
        });
        
        newState.contract = updateMilestoneAmounts(prev.contract);
        newState.commencement = updateMilestoneAmounts(prev.commencement);
        newState.midterm = updateMilestoneAmounts(prev.midterm);
        newState.balance = updateMilestoneAmounts(prev.balance);
      }
      
      return newState;
    });
  };

  const updateMilestone = (milestone: "contract" | "commencement" | "midterm" | "balance", field: keyof PaymentMilestone, value: any) => {
    setEstimate((prev) => {
      const updatedMilestone = { ...prev[milestone], [field]: value };
      
      // If percentage changed, recalculate amount
      if (field === "percentage") {
        updatedMilestone.amount = Math.round(prev.totalAmount * (Number(value) / 100));
      }
      // If amount changed, recalculate percentage
      if (field === "amount") {
        updatedMilestone.percentage = Math.round((Number(value) / prev.totalAmount) * 100);
      }

      return { ...prev, [milestone]: updatedMilestone };
    });
  };

  const updateLineItem = (id: string, field: keyof EstimateLineItem, value: any) => {
    setEstimate((prev) => {
      const newLineItems = prev.lineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate unitPrice if any component changes
          if (["materialUnitPrice", "laborUnitPrice", "expenseUnitPrice"].includes(field as string)) {
            updatedItem.unitPrice = Number(updatedItem.materialUnitPrice || 0) + 
                                   Number(updatedItem.laborUnitPrice || 0) + 
                                   Number(updatedItem.expenseUnitPrice || 0);
          }

          // Recalculate amount if quantity or unitPrice changes
          if (field === "quantity" || ["materialUnitPrice", "laborUnitPrice", "expenseUnitPrice"].includes(field as string)) {
            updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
          }
          return updatedItem;
        }
        return item;
      });

      const newTotalAmount = newLineItems.reduce((sum, item) => sum + item.amount, 0);

      // Update all milestones based on new total amount if totalAmount changed
      const updateMilestoneAmounts = (milestone: PaymentMilestone) => ({
        ...milestone,
        amount: Math.round(newTotalAmount * (milestone.percentage / 100)),
      });

      return {
        ...prev,
        lineItems: newLineItems,
        totalAmount: newTotalAmount,
        contract: updateMilestoneAmounts(prev.contract),
        commencement: updateMilestoneAmounts(prev.commencement),
        midterm: updateMilestoneAmounts(prev.midterm),
        balance: updateMilestoneAmounts(prev.balance),
      };
    });
  };

  const deleteLineItem = (id: string) => {
    setEstimate((prev) => {
      const newLineItems = prev.lineItems.filter((item) => item.id !== id);
      const newTotalAmount = newLineItems.reduce((sum, item) => sum + item.amount, 0);

      const updateMilestoneAmounts = (milestone: PaymentMilestone) => ({
        ...milestone,
        amount: Math.round(newTotalAmount * (milestone.percentage / 100)),
      });

      return {
        ...prev,
        lineItems: newLineItems,
        totalAmount: newTotalAmount,
        contract: updateMilestoneAmounts(prev.contract),
        commencement: updateMilestoneAmounts(prev.commencement),
        midterm: updateMilestoneAmounts(prev.midterm),
        balance: updateMilestoneAmounts(prev.balance),
      };
    });
  };

  const addLineItem = (newItem: Omit<EstimateLineItem, "id" | "amount">) => {
    setEstimate((prev) => {
      const id = String(prev.lineItems.length > 0 ? Math.max(...prev.lineItems.map(i => Number(i.id))) + 1 : 1);
      const unitPrice = Number(newItem.materialUnitPrice || 0) + 
                        Number(newItem.laborUnitPrice || 0) + 
                        Number(newItem.expenseUnitPrice || 0);
      const amount = Number(newItem.quantity) * unitPrice;
      const updatedItem = { ...newItem, id, unitPrice, amount };
      const newLineItems = [...prev.lineItems, updatedItem];
      const newTotalAmount = newLineItems.reduce((sum, item) => sum + item.amount, 0);

      const updateMilestoneAmounts = (milestone: PaymentMilestone) => ({
        ...milestone,
        amount: Math.round(newTotalAmount * (milestone.percentage / 100)),
      });

      return {
        ...prev,
        lineItems: newLineItems,
        totalAmount: newTotalAmount,
        contract: updateMilestoneAmounts(prev.contract),
        commencement: updateMilestoneAmounts(prev.commencement),
        midterm: updateMilestoneAmounts(prev.midterm),
        balance: updateMilestoneAmounts(prev.balance),
      };
    });
  };

  const updateAdditionalItem = (id: string, field: keyof AdditionalLineItem, value: any) => {
    setEstimate((prev) => {
      const newAdditionalItems = prev.additionalLineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "additionalAmount" || field === "originalAmount") {
            updatedItem.totalAmount = Number(updatedItem.additionalAmount) + Number(updatedItem.originalAmount);
          }
          return updatedItem;
        }
        return item;
      });
      return { ...prev, additionalLineItems: newAdditionalItems };
    });
  };

  const addAdditionalItem = (newItem: Omit<AdditionalLineItem, "id" | "totalAmount">) => {
    setEstimate((prev) => {
      const id = String(prev.additionalLineItems.length > 0 ? Math.max(...prev.additionalLineItems.map(i => Number(i.id))) + 1 : 1);
      const totalAmount = Number(newItem.additionalAmount) + Number(newItem.originalAmount);
      const updatedItem = { ...newItem, id, totalAmount };
      return { ...prev, additionalLineItems: [...prev.additionalLineItems, updatedItem] };
    });
  };

  const deleteAdditionalItem = (id: string) => {
    setEstimate((prev) => ({
      ...prev,
      additionalLineItems: prev.additionalLineItems.filter(i => i.id !== id)
    }));
  };

  const updateSpendingRequest = (id: string, field: keyof SpendingRequestItem, value: any) => {
    setEstimate((prev) => ({
      ...prev,
      spendingRequests: prev.spendingRequests.map((item) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addSpendingRequest = (newItem: Omit<SpendingRequestItem, "id">) => {
    setEstimate((prev) => {
      const id = String(prev.spendingRequests.length > 0 ? Math.max(...prev.spendingRequests.map(i => Number(i.id))) + 1 : 1);
      return { ...prev, spendingRequests: [...prev.spendingRequests, { ...newItem, id }] };
    });
  };

  const deleteSpendingRequest = (id: string) => {
    setEstimate((prev) => ({
      ...prev,
      spendingRequests: prev.spendingRequests.filter(i => i.id !== id)
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Top Bar with Collapsible Overview */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          {/* Summary Row */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={estimate.estimateStatus}
                onChange={(e) => updateField("estimateStatus", e.target.value as EstimateStatus)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border-none focus:ring-2 focus:ring-indigo-500 ${STATUS_STYLES[estimate.estimateStatus]}`}
              >
                {Object.keys(STATUS_STYLES).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={estimate.customerName}
                  onChange={(e) => updateField("customerName", e.target.value)}
                  placeholder="고객명"
                  className="text-xl font-bold text-zinc-900 dark:text-zinc-100 bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded px-1 -ml-1 w-24"
                />
                <span className="text-xl font-bold text-zinc-400">/</span>
                <input
                  type="text"
                  value={estimate.shortAddress}
                  onChange={(e) => updateField("shortAddress", e.target.value)}
                  placeholder="현장명 (간략주소)"
                  className="text-xl font-bold text-zinc-900 dark:text-zinc-100 bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded px-1 w-64"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">총 견적금액</p>
                <div className="flex items-center justify-end gap-1">
                  <input
                    type="number"
                    value={estimate.totalAmount}
                    onChange={(e) => updateField("totalAmount", Number(e.target.value))}
                    className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight bg-transparent border-none text-right focus:ring-2 focus:ring-indigo-500 rounded px-1 w-40"
                  />
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">원</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(["공사중", "공사완료", "추가공사중", "추가공사완료"] as EstimateStatus[]).includes(estimate.estimateStatus) && (
                  <button
                    onClick={() => setRightPanelMode(rightPanelMode === "additional" ? "none" : "additional")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      rightPanelMode === "additional"
                        ? "bg-purple-600 text-white shadow-lg" 
                        : "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200"
                    }`}
                  >
                    추가 견적
                  </button>
                )}
                {(["견적중", "계약완료", "공사중", "추가공사중"] as EstimateStatus[]).includes(estimate.estimateStatus) && (
                  <button
                    onClick={() => setRightPanelMode(rightPanelMode === "spending" ? "none" : "spending")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      rightPanelMode === "spending"
                        ? "bg-emerald-600 text-white shadow-lg" 
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    지출결의서
                  </button>
                )}
                <button
                  onClick={() => setOverviewOpen((v) => !v)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label={overviewOpen ? "견적 개요 접기" : "견적 개요 펼치기"}
                >
                  <ChevronIcon open={overviewOpen} />
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Overview Panel */}
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              overviewOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Schedule */}
                  <SectionCard title="공사 일정">
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <Field 
                        label="견적일" 
                        value={estimate.estimateDate} 
                        onChange={(val) => updateField("estimateDate", val)}
                        type="date"
                      />
                      <div />
                      <Field 
                        label="공사 시작일" 
                        value={estimate.constructionStartDate} 
                        onChange={(val) => updateField("constructionStartDate", val)}
                        type="date"
                      />
                      <Field 
                        label="공사 종료일" 
                        value={estimate.constructionEndDate} 
                        onChange={(val) => updateField("constructionEndDate", val)}
                        type="date"
                      />
                    </dl>
                  </SectionCard>

                  {/* Additional Work Schedule */}
                  <SectionCard title="추가공사 일정">
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <Field 
                        label="추가 견적일" 
                        value={estimate.additionalEstimateDate} 
                        onChange={(val) => updateField("additionalEstimateDate", val)}
                        type="date"
                      />
                      <div />
                      <Field 
                        label="추가공사 시작일" 
                        value={estimate.additionalConstructionStartDate} 
                        onChange={(val) => updateField("additionalConstructionStartDate", val)}
                        type="date"
                      />
                      <Field 
                        label="추가공사 종료일" 
                        value={estimate.additionalConstructionEndDate} 
                        onChange={(val) => updateField("additionalConstructionEndDate", val)}
                        type="date"
                      />
                    </dl>
                  </SectionCard>

                  {/* Personnel & Codes */}
                  <SectionCard title="담당 정보">
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <Field 
                        label="담당자" 
                        value={estimate.manager} 
                        onChange={(val) => updateField("manager", val)}
                      />
                      <Field 
                        label="현장소장" 
                        value={estimate.siteManager} 
                        onChange={(val) => updateField("siteManager", val)}
                      />
                      <Field 
                        label="견적코드" 
                        value={estimate.estimateCode} 
                        onChange={(val) => updateField("estimateCode", val)}
                      />
                    </dl>
                  </SectionCard>

                  {/* Payment Milestones */}
                  <SectionCard title="결제 일정">
                    <PaymentTimeline 
                      estimate={estimate} 
                      onMilestoneChange={updateMilestone}
                      onMoveInCleaningDateChange={(val) => updateField("moveInCleaningDate", val)}
                    />
                  </SectionCard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 내역서 Section */}
      <div className={`mx-auto px-4 sm:px-6 py-8 transition-all duration-500 ${isSplitView ? "max-w-[98%]" : "max-w-[1600px]"}`}>
        <div className={`grid gap-8 ${isSplitView ? "grid-cols-1 xl:grid-cols-[4fr_6fr]" : "grid-cols-1"}`}>
          {/* Left Column: Regular Line Items */}
          <div className={`bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm transition-all ${isSplitView ? "h-[800px] flex flex-col" : ""}`}>
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20 sticky top-0 z-10">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                내역서
              </h3>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {estimate.lineItems.length}개 항목
              </span>
            </div>
            <div className={`${isSplitView ? "overflow-y-auto flex-1" : ""}`}>
              {isSplitView ? (
                <LineItemTableCompact 
                  items={estimate.lineItems} 
                  spendingRequests={estimate.spendingRequests}
                  onMapToSpendingRequest={rightPanelMode === "spending" ? handleMapLineItemToSpending : undefined}
                  activeFilter={spendingFilter}
                  onFilterChange={setSpendingFilter}
                />
              ) : (
                <LineItemTable 
                  items={estimate.lineItems} 
                  onItemChange={updateLineItem}
                  onAddItem={addLineItem}
                  onDeleteItem={deleteLineItem}
                  spendingRequests={estimate.spendingRequests}
                  activeFilter={spendingFilter}
                  onFilterChange={setSpendingFilter}
                />
              )}
            </div>
          </div>

          {/* Right Column: Additional or Spending */}
          {isSplitView && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {rightPanelMode === "additional" && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-purple-200 dark:border-purple-900/30 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-purple-100 dark:border-purple-900/30 flex items-center justify-between bg-purple-50/30 dark:bg-purple-900/10">
                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 uppercase tracking-wider">
                      추가 공사 내역서
                    </h3>
                    <span className="text-xs text-purple-500 dark:text-purple-400">
                      {estimate.additionalLineItems.length}개 항목
                    </span>
                  </div>
                  <AdditionalItemTable 
                    items={estimate.additionalLineItems}
                    onItemChange={updateAdditionalItem}
                    onAddItem={addAdditionalItem}
                    onDeleteItem={deleteAdditionalItem}
                  />
                </div>
              )}

              {rightPanelMode === "spending" && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200 dark:border-emerald-900/30 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between bg-emerald-50/30 dark:bg-emerald-900/10">
                    <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 uppercase tracking-wider">
                      지출결의서 (RD 구매 요청)
                    </h3>
                    <span className="text-xs text-emerald-500 dark:text-emerald-400">
                      {estimate.spendingRequests.length}개 항목
                    </span>
                  </div>
                  <SpendingRequestTable 
                    items={estimate.spendingRequests}
                    lineItems={estimate.lineItems}
                    onItemChange={updateSpendingRequest}
                    onAddItem={addSpendingRequest}
                    onDeleteItem={deleteSpendingRequest}
                    isOpen={isSpendingDrawerOpen}
                    editingItem={editingSpendingRequest}
                    onOpenDrawer={handleOpenSpendingDrawer}
                    onCloseDrawer={() => setIsSpendingDrawerOpen(false)}
                    activeFilter={spendingFilter}
                    onFilterChange={setSpendingFilter}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/estimates"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
          >
            &larr; 견적 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
