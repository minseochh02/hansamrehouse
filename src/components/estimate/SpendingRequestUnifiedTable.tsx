import React, { useState } from "react";
import type { SpendingRequestItem, EstimateLineItem, SpendingFilter, AdditionalLineItem } from "@/types/estimate";

export function SpendingRequestUnifiedTable({
  lineItems,
  additionalLineItems = [],
  spendingRequests,
  onItemChange,
  onDeleteItem,
  onLineItemChange,
  onAddLineItem,
  onDeleteLineItem,
  onAdditionalItemChange,
  onAddAdditionalItem,
  onDeleteAdditionalItem,
  onOpenDrawer,
  onMapToSpendingRequest,
  onMapToAdditionalSpendingRequest,
  activeFilter,
  onFilterChange,
}: {
  lineItems: EstimateLineItem[];
  additionalLineItems?: AdditionalLineItem[];
  spendingRequests: SpendingRequestItem[];
  onItemChange: (id: string, field: keyof SpendingRequestItem, value: any) => void;
  onDeleteItem: (id: string) => void;
  onLineItemChange?: (id: string, field: keyof EstimateLineItem, value: any) => void;
  onAddLineItem?: (newItem: Omit<EstimateLineItem, "id" | "amount">) => void;
  onDeleteLineItem?: (id: string) => void;
  onAdditionalItemChange?: (id: string, field: keyof AdditionalLineItem, value: any) => void;
  onAddAdditionalItem?: (newItem: Omit<AdditionalLineItem, "id" | "totalAmount">) => void;
  onDeleteAdditionalItem?: (id: string) => void;
  onOpenDrawer: (item: SpendingRequestItem | null) => void;
  onMapToSpendingRequest: (item: EstimateLineItem) => void;
  onMapToAdditionalSpendingRequest?: (item: AdditionalLineItem) => void;
  activeFilter?: SpendingFilter;
  onFilterChange?: (filter: SpendingFilter) => void;
}) {
  const [hoveredContent, setHoveredContent] = useState<{ text: string; x: number; y: number } | null>(null);
  const [newEstimateItem, setNewEstimateItem] = useState<Omit<EstimateLineItem, "id" | "amount" | "unitPrice">>({
    category: "",
    subCategory: "",
    name: "",
    unit: "식",
    quantity: 1,
    materialUnitPrice: 0,
    laborUnitPrice: 0,
    expenseUnitPrice: 0,
    note: "",
  });

  const [newAdditionalItem, setNewAdditionalItem] = useState<Omit<AdditionalLineItem, "id" | "totalAmount">>({
    requestDate: new Date().toISOString().split('T')[0],
    location: "",
    name: "",
    materialCost: 0,
    laborCost: 0,
    expense: 0,
    additionalAmount: 0,
    originalAmount: 0,
  });

  const handleAddLineItem = () => {
    if (onAddLineItem && (newEstimateItem.name || newEstimateItem.category)) {
      onAddLineItem(newEstimateItem as any);
      setNewEstimateItem({
        category: "",
        subCategory: "",
        name: "",
        unit: "식",
        quantity: 1,
        materialUnitPrice: 0,
        laborUnitPrice: 0,
        expenseUnitPrice: 0,
        note: "",
      });
    }
  };

  const handleAddAdditionalItem = () => {
    if (onAddAdditionalItem && (newAdditionalItem.name || newAdditionalItem.location)) {
      onAddAdditionalItem(newAdditionalItem);
      setNewAdditionalItem({
        requestDate: new Date().toISOString().split('T')[0],
        location: "",
        name: "",
        materialCost: 0,
        laborCost: 0,
        expense: 0,
        additionalAmount: 0,
        originalAmount: 0,
      });
    }
  };

  const filteredLineItems = lineItems.filter((lineItem) => {
    if (!activeFilter || activeFilter.type === 'none') return true;
    if (activeFilter.type === 'category') return lineItem.category === activeFilter.value;
    if (activeFilter.type === 'subCategory') return lineItem.subCategory === activeFilter.value;
    if (activeFilter.type === 'itemName') return lineItem.name === activeFilter.value;
    return true;
  });

  const filteredAdditionalItems = (additionalLineItems || []).filter((item) => {
    if (!activeFilter || activeFilter.type === 'none') return true;
    if (activeFilter.type === 'category' && activeFilter.value === '추가공사') return true;
    if (activeFilter.type === 'subCategory' && activeFilter.value === item.location) return true;
    if (activeFilter.type === 'itemName' && activeFilter.value === item.name) return true;
    return true;
  });

  const totalEstimate = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0) + (additionalLineItems || []).reduce((sum, item) => sum + (item.additionalAmount || 0), 0);
  const totalActual = spendingRequests.reduce((sum, item) => sum + (item.totalSpendingActual || 0), 0);

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-white dark:bg-zinc-950">
      {/* Tooltip Overlay */}
      {hoveredContent && (
        <div 
          className="fixed z-[9999] pointer-events-none bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-2 rounded-lg shadow-2xl text-xs max-w-xs break-words animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            left: hoveredContent.x + 15, 
            top: hoveredContent.y + 15 
          }}
        >
          {hoveredContent.text}
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left bg-zinc-100 dark:bg-zinc-900 shadow-sm">
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight w-24">공정/날짜</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">협력업체 / 상태</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight text-right">재료비</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight text-right">노무비</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight text-right">경비</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight text-right">합계</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight w-12 text-center">비고/긴급</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {/* New Line Item Row */}
            <tr className="border-b-2 border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/10 dark:bg-indigo-900/10">
              <td className="px-3 py-2">
                <input
                  type="text"
                  placeholder="공정..."
                  value={newEstimateItem.category}
                  onChange={(e) => setNewEstimateItem({ ...newEstimateItem, category: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-[10px] focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  placeholder="품목명..."
                  value={newEstimateItem.name}
                  onChange={(e) => setNewEstimateItem({ ...newEstimateItem, name: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-[10px] focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                />
              </td>
              <td className="px-3 py-2 text-right">
                <input
                  type="number"
                  placeholder="0"
                  value={newEstimateItem.materialUnitPrice || ""}
                  onChange={(e) => setNewEstimateItem({ ...newEstimateItem, materialUnitPrice: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-[10px] text-right font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </td>
              <td className="px-3 py-2 text-right">
                <input
                  type="number"
                  placeholder="0"
                  value={newEstimateItem.laborUnitPrice || ""}
                  onChange={(e) => setNewEstimateItem({ ...newEstimateItem, laborUnitPrice: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-[10px] text-right font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </td>
              <td className="px-3 py-2 text-right">
                <input
                  type="number"
                  placeholder="0"
                  value={newEstimateItem.expenseUnitPrice || ""}
                  onChange={(e) => setNewEstimateItem({ ...newEstimateItem, expenseUnitPrice: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-[10px] text-right font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </td>
              <td className="px-3 py-2 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {((newEstimateItem.materialUnitPrice || 0) + (newEstimateItem.laborUnitPrice || 0) + (newEstimateItem.expenseUnitPrice || 0)).toLocaleString()}
              </td>
              <td className="px-3 py-2 text-center">
                <button
                  onClick={handleAddLineItem}
                  className="p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
                  title="견적 항목 추가"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </td>
              <td className="px-3 py-2"></td>
            </tr>

            {/* Header for Regular Contracts */}
            <tr className="bg-zinc-100/50 dark:bg-zinc-800/50">
               <td colSpan={8} className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">통합 견적 및 지출 내역</td>
            </tr>
            {filteredLineItems.map((lineItem) => {
              const itemRequests = spendingRequests.filter(req => req.lineItemId === lineItem.id && !req.isAdditional);
              const matchedAI = (additionalLineItems || []).filter(ai => ai.name === lineItem.name);
              
              return (
                <React.Fragment key={lineItem.id}>
                  {/* 1. 기존 견적서 (Primary Line Item Row) */}
                  <tr className="bg-zinc-50/50 dark:bg-zinc-900/30 border-t-2 border-zinc-200 dark:border-zinc-800 group">
                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          value={lineItem.category}
                          onChange={(e) => onLineItemChange && onLineItemChange(lineItem.id, "category", e.target.value)}
                          className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 py-0.5"
                        />
                        <input
                          type="text"
                          value={lineItem.subCategory}
                          onChange={(e) => onLineItemChange && onLineItemChange(lineItem.id, "subCategory", e.target.value)}
                          className="text-[9px] text-zinc-400 bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 py-0.5"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={lineItem.name}
                          onChange={(e) => onLineItemChange && onLineItemChange(lineItem.id, "name", e.target.value)}
                          className="font-bold text-zinc-900 dark:text-zinc-100 bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 py-0.5 w-full"
                        />
                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-bold whitespace-nowrap">기존 견적</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right align-top font-mono text-xs text-zinc-500">
                      <input
                        type="number"
                        value={lineItem.materialUnitPrice * lineItem.quantity}
                        onChange={(e) => onLineItemChange && onLineItemChange(lineItem.id, "materialUnitPrice", Number(e.target.value) / lineItem.quantity)}
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 text-right font-mono"
                      />
                    </td>
                    <td className="px-3 py-3 text-right align-top font-mono text-xs text-zinc-500">
                      <input
                        type="number"
                        value={lineItem.laborUnitPrice * lineItem.quantity}
                        onChange={(e) => onLineItemChange && onLineItemChange(lineItem.id, "laborUnitPrice", Number(e.target.value) / lineItem.quantity)}
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 text-right font-mono"
                      />
                    </td>
                    <td className="px-3 py-3 text-right align-top font-mono text-xs text-zinc-500">
                      <input
                        type="number"
                        value={lineItem.expenseUnitPrice * lineItem.quantity}
                        onChange={(e) => onLineItemChange && onLineItemChange(lineItem.id, "expenseUnitPrice", Number(e.target.value) / lineItem.quantity)}
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 text-right font-mono"
                      />
                    </td>
                    <td className="px-3 py-3 text-right align-top font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      {lineItem.amount.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center align-top">
                      <div className="flex items-center justify-center gap-1">
                        {lineItem.note && (
                          <div 
                            className="p-1 text-indigo-500 cursor-help"
                            onMouseEnter={(e) => setHoveredContent({ text: lineItem.note, x: e.clientX, y: e.clientY })}
                            onMouseMove={(e) => setHoveredContent({ text: lineItem.note, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setHoveredContent(null)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                        <button
                          onClick={() => onDeleteLineItem && onDeleteLineItem(lineItem.id)}
                          className="p-1 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="항목 삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onMapToSpendingRequest(lineItem)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                          title="지출 내역 추가"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (onLineItemChange) {
                              const now = new Date().toISOString().split('T')[0];
                              const newItem: Omit<AdditionalLineItem, "id" | "totalAmount"> = {
                                requestDate: now,
                                location: lineItem.subCategory || lineItem.category,
                                name: lineItem.name,
                                materialCost: 0,
                                laborCost: 0,
                                expense: 0,
                                additionalAmount: 0,
                                originalAmount: lineItem.amount,
                              };
                              onAddAdditionalItem && onAddAdditionalItem(newItem);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm active:scale-95"
                          title="추가 견적 추가"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* 2. 기존 지출서 (Associated Spending Requests) */}
                  {itemRequests.map((req) => (
                    <tr 
                      key={req.id} 
                      className="group/req bg-blue-50/20 dark:bg-blue-900/10 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors cursor-pointer border-l-4 border-l-blue-500 shadow-sm mb-0.5"
                      onClick={() => onOpenDrawer(req)}
                    >
                      <td className="px-3 py-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono pl-6">
                        {req.date}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-900 dark:text-blue-100 font-bold">{req.vendorName || "미정"}</span>
                          <span className="text-[9px] bg-blue-100/50 dark:bg-blue-900/40 px-1.5 py-0.5 rounded text-blue-600 font-bold">기존 지출</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-colors ${
                            req.paymentStatus === '완료' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:border-blue-800' :
                            req.paymentStatus === '반려' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:border-red-800' :
                            req.paymentStatus === '임시저장' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:border-amber-800' :
                            'bg-zinc-50 text-zinc-500 border-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-700'
                          }`}>
                            {req.paymentStatus === '완료' ? '결제완료' :
                             req.paymentStatus === '반려' ? '반려됨' : 
                             req.paymentStatus === '임시저장' ? '임시저장' : '결제대기'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200">{(req.materialActualCost || 0).toLocaleString()}</div>
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200">{(req.laborActualCost || 0).toLocaleString()}</div>
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200">{(req.expenseActualCost || 0).toLocaleString()}</div>
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <div className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{(req.totalSpendingActual || 0).toLocaleString()}</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {req.isUrgentToday && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(req.id);
                          }}
                          className="p-1 rounded text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover/req:opacity-100"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* 3. 추가 견적서 & 4. 추가 지출서 (Matched Additional Items and their Requests) */}
                  {matchedAI.map((addItem) => {
                    const aiRequests = spendingRequests.filter(req => req.lineItemId === addItem.id && req.isAdditional);
                    
                    return (
                      <React.Fragment key={addItem.id}>
                        {/* 추가 견적서 (Additional Item Row) */}
                        <tr className="bg-purple-50/30 dark:bg-purple-900/10 border-t border-purple-100 dark:border-purple-800 group">
                          <td className="px-3 py-3 align-top pl-6">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">추가 견적</span>
                              <input
                                type="date"
                                value={addItem.requestDate}
                                onChange={(e) => onAdditionalItemChange && onAdditionalItemChange(addItem.id, "requestDate", e.target.value)}
                                className="text-[9px] text-purple-400 bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 -ml-1 py-0.5"
                              />
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={addItem.name}
                                  onChange={(e) => onAdditionalItemChange && onAdditionalItemChange(addItem.id, "name", e.target.value)}
                                  className="font-bold text-purple-900 dark:text-purple-100 bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 -ml-1 py-0.5 w-full"
                                />
                                <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 rounded text-purple-600 font-bold whitespace-nowrap">추가 견적</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-[10px] text-purple-400">공간:</span>
                                <input
                                  type="text"
                                  value={addItem.location}
                                  onChange={(e) => onAdditionalItemChange && onAdditionalItemChange(addItem.id, "location", e.target.value)}
                                  className="text-[10px] text-purple-400 bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 -ml-1 py-0.5"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right align-top font-mono text-xs text-zinc-500">
                            <input
                              type="number"
                              value={addItem.materialCost}
                              onChange={(e) => onAdditionalItemChange && onAdditionalItemChange(addItem.id, "materialCost", Number(e.target.value))}
                              className="w-full bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 text-right font-mono"
                            />
                          </td>
                          <td className="px-3 py-3 text-right align-top font-mono text-xs text-zinc-500">
                            <input
                              type="number"
                              value={addItem.laborCost}
                              onChange={(e) => onAdditionalItemChange && onAdditionalItemChange(addItem.id, "laborCost", Number(e.target.value))}
                              className="w-full bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 text-right font-mono"
                            />
                          </td>
                          <td className="px-3 py-3 text-right align-top font-mono text-xs text-zinc-500">
                            <input
                              type="number"
                              value={addItem.expense}
                              onChange={(e) => onAdditionalItemChange && onAdditionalItemChange(addItem.id, "expense", Number(e.target.value))}
                              className="w-full bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 text-right font-mono"
                            />
                          </td>
                          <td className="px-3 py-3 text-right align-top font-mono font-bold text-purple-700 dark:text-purple-300">
                            {addItem.additionalAmount.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-center align-top">
                            <button
                              onClick={() => onDeleteAdditionalItem && onDeleteAdditionalItem(addItem.id)}
                              className="p-1 text-purple-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="추가 견적 삭제"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                          <td className="px-3 py-3 text-right align-top">
                            {onMapToAdditionalSpendingRequest && (
                              <button
                                onClick={() => onMapToAdditionalSpendingRequest(addItem)}
                                className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm active:scale-95"
                                title="추가 지출 내역 추가"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* 추가 지출서 (Associated Spending Requests for Additional Items) */}
                        {aiRequests.map((req) => (
                          <tr 
                            key={req.id} 
                            className="group/req bg-purple-50/20 dark:bg-purple-900/5 hover:bg-purple-50/40 dark:hover:bg-purple-900/10 transition-colors cursor-pointer border-l-4 border-l-purple-500 shadow-sm mb-0.5"
                            onClick={() => onOpenDrawer(req)}
                          >
                            <td className="px-3 py-2 text-[11px] text-purple-400/80 dark:text-purple-400 font-mono pl-10">
                              {req.date}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-purple-900 dark:text-purple-100 font-bold">{req.vendorName || "미정"}</span>
                                <span className="text-[9px] bg-purple-100/50 dark:bg-purple-900/40 px-1.5 py-0.5 rounded text-purple-600 font-bold">추가 지출</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-colors ${
                                  req.paymentStatus === '완료' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:border-blue-800' :
                                  req.paymentStatus === '반려' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:border-red-800' :
                                  req.paymentStatus === '임시저장' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:border-amber-800' :
                                  'bg-zinc-50 text-zinc-500 border-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-700'
                                }`}>
                                  {req.paymentStatus === '완료' ? '결제완료' :
                                   req.paymentStatus === '반려' ? '반려됨' : 
                                   req.paymentStatus === '임시저장' ? '임시저장' : '결제대기'}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">
                              <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200">{(req.materialActualCost || 0).toLocaleString()}</div>
                            </td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">
                              <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200">{(req.laborActualCost || 0).toLocaleString()}</div>
                            </td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">
                              <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200">{(req.expenseActualCost || 0).toLocaleString()}</div>
                            </td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">
                              <div className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">{(req.totalSpendingActual || 0).toLocaleString()}</div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {req.isUrgentToday && (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteItem(req.id);
                                }}
                                className="p-1 rounded text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover/req:opacity-100"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}

            {/* Section for Unmatched Additional Items (if any) */}
            {(() => {
              const unmatchedAI = (additionalLineItems || []).filter(ai => !lineItems.some(li => li.name === ai.name));
              if (unmatchedAI.length === 0) return null;
              
              return (
                <>
                  <tr className="bg-purple-100/30 dark:bg-purple-900/30 border-t-4 border-purple-500/20">
                     <td colSpan={8} className="px-4 py-3 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-2">
                       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       독립 추가 견적 내역 (본 견적에 없는 품목)
                     </td>
                  </tr>
                  {/* New Independent Additional Item Row */}
                  <tr className="border-b-2 border-purple-100 dark:border-purple-900/30 bg-purple-50/10 dark:bg-purple-900/10">
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={newAdditionalItem.requestDate}
                        onChange={(e) => setNewAdditionalItem({ ...newAdditionalItem, requestDate: e.target.value })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-[10px] focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        placeholder="품목명(독립)..."
                        value={newAdditionalItem.name}
                        onChange={(e) => setNewAdditionalItem({ ...newAdditionalItem, name: e.target.value })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-[10px] focus:ring-1 focus:ring-purple-500 outline-none font-bold text-purple-700 dark:text-purple-300"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        placeholder="0"
                        value={newAdditionalItem.materialCost || ""}
                        onChange={(e) => setNewAdditionalItem({ ...newAdditionalItem, materialCost: Number(e.target.value) })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-[10px] text-right font-mono focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        placeholder="0"
                        value={newAdditionalItem.laborCost || ""}
                        onChange={(e) => setNewAdditionalItem({ ...newAdditionalItem, laborCost: Number(e.target.value) })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-[10px] text-right font-mono focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        placeholder="0"
                        value={newAdditionalItem.expense || ""}
                        onChange={(e) => setNewAdditionalItem({ ...newAdditionalItem, expense: Number(e.target.value) })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-[10px] text-right font-mono focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                      {((newAdditionalItem.materialCost || 0) + (newAdditionalItem.laborCost || 0) + (newAdditionalItem.expense || 0)).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={handleAddAdditionalItem}
                        className="p-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
                        title="독립 추가 견적 항목 추가"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-3 py-2"></td>
                  </tr>
                  {unmatchedAI.map((addItem) => {
                    const aiRequests = spendingRequests.filter(req => req.lineItemId === addItem.id && req.isAdditional);
                    
                    return (
                      <React.Fragment key={addItem.id}>
                        <tr className="bg-purple-50/30 dark:bg-purple-900/10 border-t border-purple-100 dark:border-purple-800 group">
                          <td className="px-3 py-3 align-top">
                            <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">추가공사</div>
                            <div className="text-[9px] text-purple-400">{addItem.requestDate}</div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-zinc-900 dark:text-zinc-100">{addItem.name}</span>
                                <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 rounded text-purple-600 font-bold">추가 견적</span>
                              </div>
                              <div className="text-[10px] text-purple-400 mt-1">공간: {addItem.location}</div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right align-top font-mono text-xs text-zinc-500">{(addItem.materialCost || 0).toLocaleString()}</td>
                          <td className="px-3 py-3 text-right align-top font-mono text-xs text-zinc-500">{(addItem.laborCost || 0).toLocaleString()}</td>
                          <td className="px-3 py-3 text-right align-top font-mono text-xs text-zinc-500">{(addItem.expense || 0).toLocaleString()}</td>
                          <td className="px-3 py-3 text-right align-top font-mono font-bold text-purple-700 dark:text-purple-300">
                            {addItem.additionalAmount.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-center align-top"></td>
                          <td className="px-3 py-3 text-right align-top">
                            {onMapToAdditionalSpendingRequest && (
                              <button
                                onClick={() => onMapToAdditionalSpendingRequest(addItem)}
                                className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm active:scale-95"
                                title="추가 지출 내역 추가"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                        {aiRequests.map((req) => (
                          <tr 
                            key={req.id} 
                            className="group/req bg-purple-50/20 dark:bg-purple-900/5 hover:bg-purple-50/40 dark:hover:bg-purple-900/10 transition-colors cursor-pointer border-l-4 border-l-purple-500 shadow-sm mb-0.5"
                            onClick={() => onOpenDrawer(req)}
                          >
                            <td className="px-3 py-2 text-[11px] text-purple-400/80 dark:text-purple-400 font-mono pl-6">{req.date}</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-purple-900 dark:text-purple-100 font-bold">{req.vendorName || "미정"}</span>
                                <span className="text-[9px] bg-purple-100/50 dark:bg-purple-900/40 px-1.5 py-0.5 rounded text-purple-600 font-bold">추가 지출</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-colors ${
                                  req.paymentStatus === '완료' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:border-blue-800' :
                                  req.paymentStatus === '반려' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:border-red-800' :
                                  req.paymentStatus === '임시저장' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:border-amber-800' :
                                  'bg-zinc-50 text-zinc-500 border-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-700'
                                }`}>
                                  {req.paymentStatus === '완료' ? '결제완료' :
                                   req.paymentStatus === '반려' ? '반려됨' : 
                                   req.paymentStatus === '임시저장' ? '임시저장' : '결제대기'}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right whitespace-nowrap font-mono text-xs">{(req.materialActualCost || 0).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap font-mono text-xs">{(req.laborActualCost || 0).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap font-mono text-xs">{(req.expenseActualCost || 0).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap font-mono font-bold text-purple-600 dark:text-purple-400">{(req.totalSpendingActual || 0).toLocaleString()}</td>
                            <td className="px-3 py-2 text-center"></td>
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={(e) => { e.stopPropagation(); onDeleteItem(req.id); }}
                                className="p-1 rounded text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/req:opacity-100"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </>
              );
            })()}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky bottom-0 z-10">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">총 견적 합계</span>
            <span className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100">{totalEstimate.toLocaleString()} 원</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">총 지출 실행 합계</span>
            <span className="text-base font-mono font-bold text-blue-600 dark:text-blue-400">{totalActual.toLocaleString()} 원</span>
          </div>
        </div>
        
        <div className={`text-sm font-bold ${totalActual > totalEstimate ? 'text-red-600' : 'text-zinc-500'}`}>
          수익성: {(totalEstimate - totalActual).toLocaleString()} 원
          <span className="ml-1 font-normal text-xs">({totalEstimate > 0 ? ((totalEstimate - totalActual) / totalEstimate * 100).toFixed(1) : 0}%)</span>
        </div>
      </div>
    </div>
  );
}
