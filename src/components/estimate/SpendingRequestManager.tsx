import { useState } from "react";
import type { SpendingRequestItem, EstimateLineItem, SpendingFilter } from "@/types/estimate";
import { SpendingRequestTable } from "./SpendingRequestTable";
import { LineItemTableCompact } from "./LineItemTableCompact";
import { SpendingRequestUnifiedTable } from "./SpendingRequestUnifiedTable";
import { SpendingRequestDrawer } from "./SpendingRequestDrawer";

export function SpendingRequestManager({
  lineItems,
  spendingRequests,
  onAddSpendingRequest,
  onUpdateSpendingRequest,
  onDeleteSpendingRequest,
  activeFilter,
  onFilterChange,
}: {
  lineItems: EstimateLineItem[];
  spendingRequests: SpendingRequestItem[];
  onAddSpendingRequest: (newItem: Omit<SpendingRequestItem, "id">) => void;
  onUpdateSpendingRequest: (id: string, field: keyof SpendingRequestItem, value: any) => void;
  onDeleteSpendingRequest: (id: string) => void;
  activeFilter: SpendingFilter;
  onFilterChange: (filter: SpendingFilter) => void;
}) {
  const [viewMode, setViewMode] = useState<"split" | "single">("single");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SpendingRequestItem | null>(null);

  const handleOpenDrawer = (item: SpendingRequestItem | null = null) => {
    setEditingItem(item);
    setIsDrawerOpen(true);
  };

  const handleSave = (itemData: SpendingRequestItem | Omit<SpendingRequestItem, "id">) => {
    if ("id" in itemData) {
      Object.keys(itemData).forEach((key) => {
        const field = key as keyof SpendingRequestItem;
        if (field !== "id") {
          onUpdateSpendingRequest(itemData.id, field, itemData[field]);
        }
      });
    } else {
      onAddSpendingRequest(itemData);
    }
    setIsDrawerOpen(false);
  };

  const handleMapLineItemToSpending = (lineItem: EstimateLineItem) => {
    const now = new Date().toISOString().split('T')[0];
    
    // Calculate previously spent amounts for this line item
    const otherRequests = spendingRequests.filter(req => req.lineItemId === lineItem.id);
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
    
    setEditingItem(newItem as SpendingRequestItem);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mode Switcher */}
      <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/10">
        <div className="flex bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg">
          <button
            onClick={() => setViewMode("split")}
            title="2단 보기 (내역서 + 지출결의서)"
            className={`px-3 py-1.5 rounded-md transition-all ${
              viewMode === "split" 
                ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("single")}
            title="1단 보기 (통합 내역)"
            className={`px-3 py-1.5 rounded-md transition-all ${
              viewMode === "single" 
                ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
           {activeFilter.type !== 'none' && (
             <button
               onClick={() => onFilterChange({ type: 'none', value: '' })}
               className="text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-800 font-bold flex items-center gap-1"
             >
               필터: {activeFilter.value}
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
           )}
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 min-h-0">
        {viewMode === "split" ? (
          <div className="grid grid-cols-1 lg:grid-cols-[4fr_6fr] h-full divide-x divide-zinc-200 dark:divide-zinc-800">
            <div className="flex flex-col min-h-0 bg-zinc-50/30 dark:bg-zinc-900/50">
              <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">내역서 (견적항목)</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <LineItemTableCompact 
                  items={lineItems}
                  spendingRequests={spendingRequests}
                  onMapToSpendingRequest={handleMapLineItemToSpending}
                  activeFilter={activeFilter}
                  onFilterChange={onFilterChange}
                />
              </div>
            </div>
            <div className="flex flex-col min-h-0">
              <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">지출결의서 목록</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SpendingRequestTable 
                  items={spendingRequests}
                  lineItems={lineItems}
                  onItemChange={onUpdateSpendingRequest}
                  onAddItem={onAddSpendingRequest}
                  onDeleteItem={onDeleteSpendingRequest}
                  isOpen={false} // Drawer managed by Manager
                  editingItem={null}
                  onOpenDrawer={handleOpenDrawer}
                  onCloseDrawer={() => {}}
                  activeFilter={activeFilter}
                  onFilterChange={onFilterChange}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
            <div className="flex-1 overflow-y-auto">
              <SpendingRequestUnifiedTable 
                lineItems={lineItems}
                spendingRequests={spendingRequests}
                onItemChange={onUpdateSpendingRequest}
                onDeleteItem={onDeleteSpendingRequest}
                onOpenDrawer={handleOpenDrawer}
                onMapToSpendingRequest={handleMapLineItemToSpending}
                activeFilter={activeFilter}
                onFilterChange={onFilterChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* Plus Button Row */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <button
          onClick={() => handleOpenDrawer(null)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          새 지출결의서 작성
        </button>
      </div>

      <SpendingRequestDrawer
        item={editingItem}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSave}
        allSpendingRequests={spendingRequests}
        lineItems={lineItems}
      />
    </div>
  );
}
