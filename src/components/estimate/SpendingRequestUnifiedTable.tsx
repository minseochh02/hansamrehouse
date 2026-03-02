import React, { useState } from "react";
import type { SpendingRequestItem, EstimateLineItem, SpendingFilter } from "@/types/estimate";

export function SpendingRequestUnifiedTable({
  lineItems,
  spendingRequests,
  onItemChange,
  onDeleteItem,
  onOpenDrawer,
  onMapToSpendingRequest,
  activeFilter,
  onFilterChange,
}: {
  lineItems: EstimateLineItem[];
  spendingRequests: SpendingRequestItem[];
  onItemChange: (id: string, field: keyof SpendingRequestItem, value: any) => void;
  onDeleteItem: (id: string) => void;
  onOpenDrawer: (item: SpendingRequestItem | null) => void;
  onMapToSpendingRequest: (item: EstimateLineItem) => void;
  activeFilter?: SpendingFilter;
  onFilterChange?: (filter: SpendingFilter) => void;
}) {
  const [hoveredContent, setHoveredContent] = useState<{ text: string; x: number; y: number } | null>(null);

  const filteredLineItems = lineItems.filter((lineItem) => {
    if (!activeFilter || activeFilter.type === 'none') return true;
    if (activeFilter.type === 'category') return lineItem.category === activeFilter.value;
    if (activeFilter.type === 'subCategory') return lineItem.subCategory === activeFilter.value;
    if (activeFilter.type === 'itemName') return lineItem.name === activeFilter.value;
    return true;
  });

  const totalEstimate = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
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
          <thead className="sticky top-0 z-20">
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left bg-zinc-100 dark:bg-zinc-900 shadow-sm">
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight w-24">공정/날짜</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">품목명 / 협력업체</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight w-16">상태</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight text-right">재료비</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight text-right">노무비</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight text-right">경비</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight text-right">합계</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight w-12 text-center">비고/긴급</th>
              <th className="px-3 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredLineItems.map((lineItem) => {
              const itemRequests = spendingRequests.filter(req => req.lineItemId === lineItem.id);
              
              return (
                <React.Fragment key={lineItem.id}>
                  {/* Primary Line Item Row (from 견적서) */}
                  <tr className="bg-zinc-50/50 dark:bg-zinc-900/30 border-t-2 border-zinc-200 dark:border-zinc-800 group">
                    <td className="px-3 py-3 align-top">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{lineItem.category}</div>
                      <div className="text-[9px] text-zinc-400">{lineItem.subCategory}</div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{lineItem.name}</span>
                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">견적</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="text-[10px] text-zinc-400 text-center">-</div>
                    </td>
                    <td className="px-3 py-3 text-right align-top font-mono text-xs text-zinc-500">
                      {(lineItem.materialUnitPrice * lineItem.quantity).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right align-top font-mono text-xs text-zinc-500">
                      {(lineItem.laborUnitPrice * lineItem.quantity).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right align-top font-mono text-xs text-zinc-500">
                      {(lineItem.expenseUnitPrice * lineItem.quantity).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right align-top font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      {lineItem.amount.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center align-top">
                      {lineItem.note && (
                        <div 
                          className="inline-block p-1 text-indigo-500 cursor-help"
                          onMouseEnter={(e) => setHoveredContent({ text: lineItem.note, x: e.clientX, y: e.clientY })}
                          onMouseMove={(e) => setHoveredContent({ text: lineItem.note, x: e.clientX, y: e.clientY })}
                          onMouseLeave={() => setHoveredContent(null)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right align-top">
                      <button
                        onClick={() => onMapToSpendingRequest(lineItem)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                        title="지출 내역 추가"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </td>
                  </tr>

                  {/* Associated Spending Requests (지출결의서) */}
                  {itemRequests.map((req) => (
                    <tr 
                      key={req.id} 
                      className="group/req hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors cursor-pointer border-l-4 border-l-emerald-500/20"
                      onClick={() => onOpenDrawer(req)}
                    >
                      <td className="px-3 py-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono pl-6">
                        {req.date}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium">{req.itemName}</span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">[{req.vendorName || "미정"}]</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          req.status === '최초' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                          req.status === '변경' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                          'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {req.status}
                        </span>
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
                        <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{(req.totalSpendingActual || 0).toLocaleString()}</div>
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

                  {itemRequests.length === 0 && (
                    <tr className="bg-zinc-50/20 dark:bg-zinc-900/10">
                      <td colSpan={9} className="px-6 py-2 text-[10px] text-zinc-400 italic">
                        연결된 지출 내역이 없습니다. 우측 + 버튼을 눌러 추가하세요.
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky bottom-0 z-20">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">총 견적 합계</span>
            <span className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100">{totalEstimate.toLocaleString()} 원</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">총 지출 실행 합계</span>
            <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">{totalActual.toLocaleString()} 원</span>
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
