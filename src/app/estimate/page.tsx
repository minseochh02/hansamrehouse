"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
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
import { SpendingRequestUnifiedTable } from "@/components/estimate/SpendingRequestUnifiedTable";
import { SpendingRequestDrawer } from "@/components/estimate/SpendingRequestDrawer";
import { ChevronIcon } from "@/components/estimate/ChevronIcon";

const EMPTY_ESTIMATE: Estimate = {
  customerName: "",
  shortAddress: "",
  estimateDate: new Date().toISOString().split('T')[0],
  constructionStartDate: "",
  constructionEndDate: "",
  additionalEstimateDate: "",
  additionalConstructionStartDate: "",
  additionalConstructionEndDate: "",
  manager: "",
  siteManager: "",
  estimateCode: "",
  estimateStatus: "상담접수",
  siteCode: "",
  totalAmount: 0,
  contract: { date: "", percentage: 0, amount: 0 },
  commencement: { date: "", percentage: 0, amount: 0 },
  midterm: { date: "", percentage: 0, amount: 0 },
  moveInCleaningDate: "",
  balance: { date: "", percentage: 0, amount: 0 },
  lineItems: [],
  additionalLineItems: [],
  spendingRequests: [],
};

export default function EstimatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const estimateId = searchParams.get("id");

  const [overviewOpen, setOverviewOpen] = useState(true);
  const [estimate, setEstimate] = useState<Estimate>(EMPTY_ESTIMATE);
  const [isLoading, setIsLoading] = useState(!!estimateId);
  const [spendingFilter, setSpendingFilter] = useState<SpendingFilter>({ type: "none", value: "" });

  useEffect(() => {
    if (estimateId) {
      fetchEstimate(estimateId);
    }
  }, [estimateId]);

  const fetchEstimate = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await apiFetch(`/api/estimates/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEstimate(data);
      } else {
        console.error(`Failed to fetch estimate: ${response.status} ${response.statusText}`);
        alert(`견적을 불러올 수 없습니다. (${response.status})`);
        // Keep EMPTY_ESTIMATE as fallback
      }
    } catch (error) {
      console.error("Failed to fetch estimate:", error);
      alert("견적 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!estimateId) return;
    try {
      const response = await apiFetch(`/api/estimates/${estimateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estimate),
      });
      if (response.ok) {
        alert("성공적으로 저장되었습니다.");
      } else {
        throw new Error("저장 실패");
      }
    } catch (error) {
      console.error("Failed to save estimate:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!estimateId) return;
    if (!confirm("정말로 이 견적을 삭제하시겠습니까? 관련 데이터(일정, 품목, 지출결의 등)가 모두 삭제되며 복구할 수 없습니다.")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiFetch(`/api/estimates/${estimateId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("성공적으로 삭제되었습니다.");
        router.push("/estimates");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "삭제 실패");
      }
    } catch (error: any) {
      console.error("Failed to delete estimate:", error);
      alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Spending Request Drawer State
  const [isSpendingDrawerOpen, setIsSpendingDrawerOpen] = useState(false);
  const [editingSpendingRequest, setEditingSpendingRequest] = useState<SpendingRequestItem | null>(null);

  const handleOpenSpendingDrawer = (item: SpendingRequestItem | null = null) => {
    setEditingSpendingRequest(item);
    setIsSpendingDrawerOpen(true);
  };

  const handleMapLineItemToSpending = (lineItem: EstimateLineItem) => {
    const now = new Date().toISOString().split('T')[0];
    
    // Calculate total previous spending for this item name
    const relatedRequests = estimate.spendingRequests.filter(req => req.itemName === lineItem.name);
    const matSpent = relatedRequests.reduce((sum, req) => sum + (req.materialActualCost || 0), 0);
    const labSpent = relatedRequests.reduce((sum, req) => sum + (req.laborActualCost || 0), 0);
    const expSpent = relatedRequests.reduce((sum, req) => sum + (req.expenseActualCost || 0), 0);

    // Calculate total additions for this item name
    const matchedAdditions = (estimate.additionalLineItems || []).filter(ai => ai.name === lineItem.name);
    const matAdditions = matchedAdditions.reduce((sum, ai) => sum + (ai.materialCost || 0), 0);
    const labAdditions = matchedAdditions.reduce((sum, ai) => sum + (ai.laborCost || 0), 0);
    const expAdditions = matchedAdditions.reduce((sum, ai) => sum + (ai.expense || 0), 0);

    // Formula: 견적가 = 기존 견적서 - 기존지출서 + 추가 견적서
    const matEst = (lineItem.materialUnitPrice * lineItem.quantity) - matSpent + matAdditions;
    const labEst = (lineItem.laborUnitPrice * lineItem.quantity) - labSpent + labAdditions;
    const expEst = (lineItem.expenseUnitPrice * lineItem.quantity) - expSpent + expAdditions;

    const newItem: Omit<SpendingRequestItem, "id"> = {
      lineItemId: lineItem.id,
      processName: lineItem.category,
      subProcessName: lineItem.subCategory,
      itemName: lineItem.name,
      materialEstimateCost: matEst,
      materialActualCost: 0,
      laborEstimateCost: labEst,
      laborActualCost: 0,
      expenseEstimateCost: expEst,
      expenseActualCost: 0,
      materialPreviouslySpent: matSpent,
      laborPreviouslySpent: labSpent,
      expensePreviouslySpent: expSpent,
      totalEstimateCost: matEst + labEst + expEst,
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
      paymentStatus: "임시저장",
      createdAt: now,
      updatedAt: now,
    };
    setEditingSpendingRequest(newItem as SpendingRequestItem);
    setIsSpendingDrawerOpen(true);
  };

  const handleMapAdditionalItemToSpending = (additionalItem: AdditionalLineItem) => {
    const now = new Date().toISOString().split('T')[0];
    
    // Find original item if it exists to get base costs
    const originalItem = estimate.lineItems.find(li => li.name === additionalItem.name);

    // Calculate total previous spending for this item name
    const relatedRequests = estimate.spendingRequests.filter(req => req.itemName === additionalItem.name);
    const matSpent = relatedRequests.reduce((sum, req) => sum + (req.materialActualCost || 0), 0);
    const labSpent = relatedRequests.reduce((sum, req) => sum + (req.laborActualCost || 0), 0);
    const expSpent = relatedRequests.reduce((sum, req) => sum + (req.expenseActualCost || 0), 0);

    // Formula: 견적가 = 기존 견적서 - 기존지출서 + 추가 견적서
    const matEst = (originalItem ? (originalItem.materialUnitPrice * originalItem.quantity) : 0) - matSpent + (additionalItem.materialCost || 0);
    const labEst = (originalItem ? (originalItem.laborUnitPrice * originalItem.quantity) : 0) - labSpent + (additionalItem.laborCost || 0);
    const expEst = (originalItem ? (originalItem.expenseUnitPrice * originalItem.quantity) : 0) - expSpent + (additionalItem.expense || 0);

    const newItem: Omit<SpendingRequestItem, "id"> = {
      lineItemId: additionalItem.id,
      processName: "추가공사",
      subProcessName: additionalItem.location,
      itemName: additionalItem.name,
      materialEstimateCost: matEst,
      materialActualCost: 0,
      laborEstimateCost: labEst,
      laborActualCost: 0,
      expenseEstimateCost: expEst,
      expenseActualCost: 0,
      materialPreviouslySpent: matSpent,
      laborPreviouslySpent: labSpent,
      expensePreviouslySpent: expSpent,
      totalEstimateCost: matEst + labEst + expEst,
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
      paymentStatus: "임시저장",
      isAdditional: true,
      createdAt: now,
      updatedAt: now,
    };
    setEditingSpendingRequest(newItem as SpendingRequestItem);
    setIsSpendingDrawerOpen(true);
  };

  const totalSpendingActual = estimate.spendingRequests.reduce((sum, req) => sum + (req.totalSpendingActual || 0), 0);
  const totalAdditionalProfit = estimate.additionalLineItems.reduce((sum, item) => sum + (item.additionalAmount || 0), 0);
  const totalContractAmount = estimate.totalAmount + totalAdditionalProfit;
  
  const margin = totalContractAmount - totalSpendingActual;
  const marginPercent = totalContractAmount > 0 ? (margin / totalContractAmount) * 100 : 0;

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
          if (["materialCost", "laborCost", "expense", "originalAmount"].includes(field as string)) {
            updatedItem.additionalAmount = Number(updatedItem.materialCost || 0) + 
                                          Number(updatedItem.laborCost || 0) + 
                                          Number(updatedItem.expense || 0);
            updatedItem.totalAmount = Number(updatedItem.additionalAmount) + Number(updatedItem.originalAmount || 0);
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
      const additionalAmount = Number(newItem.materialCost || 0) + 
                              Number(newItem.laborCost || 0) + 
                              Number(newItem.expense || 0);
      const totalAmount = additionalAmount + Number(newItem.originalAmount || 0);
      const updatedItem = { ...newItem, id, additionalAmount, totalAmount };
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse font-medium">견적 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Top Bar with Collapsible Overview */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          {/* Summary Row */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/estimates"
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                title="견적 목록으로 돌아가기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
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
            <div className="flex items-center gap-6">
              <div className="text-right border-r border-zinc-200 dark:border-zinc-800 pr-6">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">지출결의 합계</p>
                <div className="flex items-center justify-end gap-1">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                    {totalSpendingActual.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">원</span>
                </div>
              </div>
              <div className="text-right border-r border-zinc-200 dark:border-zinc-800 pr-6">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">예상 수익 (수익률)</p>
                <div className="flex items-center justify-end gap-2">
                  <span className={`text-xl font-bold font-mono tracking-tight ${margin < 0 ? 'text-red-500' : 'text-zinc-600 dark:text-zinc-300'}`}>
                    {margin.toLocaleString()}
                  </span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${margin < 0 ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-600'}`}>
                    {marginPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">총 견적금액</p>
                <div className="flex items-center justify-end gap-1">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight text-right px-1">
                    {totalContractAmount.toLocaleString()}
                  </div>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">원</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  title="견적 삭제"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
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

      {/* 통합 관리 Section */}
      <div className="mx-auto px-4 sm:px-6 py-8 max-w-[1600px]">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-lg max-h-[1000px] flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                견적 및 지출 통합 관리
              </h3>
              {spendingFilter.type !== 'none' && (
                <button
                  onClick={() => setSpendingFilter({ type: 'none', value: '' })}
                  className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-full border border-indigo-100 dark:border-indigo-800 font-bold flex items-center gap-1"
                >
                  필터 해제
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-zinc-400"></span> 기본 견적
              </span>
              <span className="flex items-center gap-1.5 text-purple-500">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> 추가 견적
              </span>
              <span className="flex items-center gap-1.5 text-blue-500">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> 지출결의
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <SpendingRequestUnifiedTable
              lineItems={estimate.lineItems}
              additionalLineItems={estimate.additionalLineItems}
              spendingRequests={estimate.spendingRequests}
              onItemChange={updateSpendingRequest}
              onDeleteItem={deleteSpendingRequest}
              onLineItemChange={updateLineItem}
              onAddLineItem={addLineItem}
              onDeleteLineItem={deleteLineItem}
              onAdditionalItemChange={updateAdditionalItem}
              onAddAdditionalItem={addAdditionalItem}
              onDeleteAdditionalItem={deleteAdditionalItem}
              onOpenDrawer={handleOpenSpendingDrawer}
              onMapToSpendingRequest={handleMapLineItemToSpending}
              onMapToAdditionalSpendingRequest={handleMapAdditionalItemToSpending}
              activeFilter={spendingFilter}
              onFilterChange={setSpendingFilter}
            />
          </div>
        </div>

        {/* Spending Request Drawer */}
        <SpendingRequestDrawer
          item={editingSpendingRequest}
          isOpen={isSpendingDrawerOpen}
          onClose={() => setIsSpendingDrawerOpen(false)}
          onSave={(itemData) => {
            if ("id" in itemData) {
              Object.keys(itemData).forEach((key) => {
                const field = key as keyof SpendingRequestItem;
                if (field !== "id") {
                  updateSpendingRequest(itemData.id, field, itemData[field]);
                }
              });
            } else {
              addSpendingRequest(itemData);
            }
            setIsSpendingDrawerOpen(false);
          }}
          allSpendingRequests={estimate.spendingRequests}
          lineItems={estimate.lineItems}
        />

        {/* Bottom Action Section */}
        <div className="mt-12 flex flex-col items-center gap-4 pb-20">
          <button
            onClick={handleSave}
            className="w-full max-w-sm py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            견적 내용 저장하기
          </button>
          
          <Link
            href="/estimates"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium flex items-center gap-1 transition-colors"
          >
            &larr; 견적 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
