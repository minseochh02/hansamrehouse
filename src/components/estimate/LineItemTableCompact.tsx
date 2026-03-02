import { useState } from "react";
import type { EstimateLineItem, SpendingRequestItem, SpendingFilter } from "@/types/estimate";

export function LineItemTableCompact({ 
  items,
  spendingRequests = [],
  onMapToSpendingRequest,
  activeFilter,
  onFilterChange,
}: { 
  items: EstimateLineItem[];
  spendingRequests?: SpendingRequestItem[];
  onMapToSpendingRequest?: (item: EstimateLineItem) => void;
  activeFilter?: SpendingFilter;
  onFilterChange?: (filter: SpendingFilter) => void;
}) {
  const [hoveredContent, setHoveredContent] = useState<{ text: string; x: number; y: number } | null>(null);

  const totalMaterial = items.reduce((sum, item) => sum + (item.materialUnitPrice * item.quantity), 0);
  const totalLabor = items.reduce((sum, item) => sum + (item.laborUnitPrice * item.quantity), 0);
  const totalExpense = items.reduce((sum, item) => sum + (item.expenseUnitPrice * item.quantity), 0);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const grandTotalActualMaterial = spendingRequests.reduce((sum, r) => sum + (r.materialActualCost || 0), 0);
  const grandTotalActualLabor = spendingRequests.reduce((sum, r) => sum + (r.laborActualCost || 0), 0);
  const grandTotalActualExpense = spendingRequests.reduce((sum, r) => sum + (r.expenseActualCost || 0), 0);
  const grandTotalActual = grandTotalActualMaterial + grandTotalActualLabor + grandTotalActualExpense;

  const categories = Array.from(new Set(items.map((item) => item.category)));

  const handleFilterClick = (type: SpendingFilter['type'], value: string) => {
    if (!onFilterChange) return;
    if (activeFilter?.type === type && activeFilter?.value === value) {
      onFilterChange({ type: 'none', value: '' });
    } else {
      onFilterChange({ type, value });
    }
  };

  return (
    <div className="overflow-x-auto relative h-full">
      {/* Tooltip Overlay */}
      {hoveredContent && (
        <div 
          className="fixed z-[9999] pointer-events-none bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-2 py-2 rounded-lg shadow-2xl text-xs max-w-xs break-words animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            left: hoveredContent.x + 15, 
            top: hoveredContent.y + 15 
          }}
        >
          {hoveredContent.text}
        </div>
      )}

      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-50 dark:bg-zinc-800">
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-24">공정</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-24">세부공정</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-24">품목명</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right w-32">금액</th>
            {onMapToSpendingRequest && <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-10"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {categories.map((cat) => {
            const catItems = items.filter((item) => item.category === cat);

            return catItems.map((item, idx) => {
              const subCatItems = catItems.filter((i) => i.subCategory === item.subCategory);
              const isFirstInSubCat = catItems.findIndex((i) => i.subCategory === item.subCategory) === idx;

              const matchedRequests = spendingRequests.filter(
                (r) => r.processName === item.category && 
                       r.subProcessName === item.subCategory && 
                       r.itemName === item.name
              );

              const actualMaterial = matchedRequests.reduce((sum, r) => sum + (r.materialActualCost || 0), 0);
              const actualLabor = matchedRequests.reduce((sum, r) => sum + (r.laborActualCost || 0), 0);
              const actualExpense = matchedRequests.reduce((sum, r) => sum + (r.expenseActualCost || 0), 0);
              const totalActual = actualMaterial + actualLabor + actualExpense;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-50 dark:border-zinc-900"
                >
                  {idx === 0 ? (
                    <td
                      rowSpan={catItems.length}
                      onClick={() => handleFilterClick('category', cat)}
                      className={`px-2 py-1.5 font-medium text-zinc-900 dark:text-zinc-100 align-top cursor-pointer transition-colors w-24 ${
                        activeFilter?.type === 'category' && activeFilter?.value === cat
                          ? "bg-emerald-100 dark:bg-emerald-900/40"
                          : "bg-zinc-50/50 dark:bg-zinc-800/30"
                      }`}
                    >
                      <div 
                        className="text-xs truncate"
                        onMouseEnter={(e) => setHoveredContent({ text: cat, x: e.clientX, y: e.clientY })}
                        onMouseMove={(e) => setHoveredContent({ text: cat, x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHoveredContent(null)}
                      >
                        {cat}
                      </div>
                    </td>
                  ) : null}
                  {isFirstInSubCat ? (
                    <td
                      rowSpan={subCatItems.length}
                      onClick={() => handleFilterClick('subCategory', item.subCategory)}
                      className={`px-2 py-1.5 align-top border-l border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors w-24 ${
                        activeFilter?.type === 'subCategory' && activeFilter?.value === item.subCategory
                          ? "bg-emerald-100 dark:bg-emerald-900/40"
                          : "bg-zinc-50/20 dark:bg-zinc-800/10"
                      }`}
                    >
                      <div 
                        className="text-xs truncate text-zinc-600 dark:text-zinc-400"
                        onMouseEnter={(e) => setHoveredContent({ text: item.subCategory, x: e.clientX, y: e.clientY })}
                        onMouseMove={(e) => setHoveredContent({ text: item.subCategory, x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHoveredContent(null)}
                      >
                        {item.subCategory}
                      </div>
                    </td>
                  ) : null}
                  <td 
                    className={`px-2 py-1.5 max-w-[100px] cursor-pointer transition-colors ${
                      activeFilter?.type === 'itemName' && activeFilter?.value === item.name
                        ? "bg-emerald-100 dark:bg-emerald-900/40"
                        : ""
                    }`}
                    onClick={() => handleFilterClick('itemName', item.name)}
                  >
                    <div 
                      className="text-xs truncate text-zinc-900 dark:text-zinc-100"
                      onMouseEnter={(e) => setHoveredContent({ text: item.name, x: e.clientX, y: e.clientY })}
                      onMouseMove={(e) => setHoveredContent({ text: item.name, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHoveredContent(null)}
                    >
                      {item.name}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100 text-xs leading-tight whitespace-nowrap">
                    <div className="flex flex-col text-[9px] leading-tight">
                      <div className="flex justify-end gap-1 whitespace-nowrap">
                        <span className="text-zinc-400">{(item.materialUnitPrice * item.quantity).toLocaleString()}</span>
                        {actualMaterial > 0 && <span className="text-emerald-600 font-bold">- {actualMaterial.toLocaleString()}</span>}
                      </div>
                      <div className="flex justify-end gap-1 whitespace-nowrap">
                        <span className="text-zinc-400">{(item.laborUnitPrice * item.quantity).toLocaleString()}</span>
                        {actualLabor > 0 && <span className="text-emerald-600 font-bold">- {actualLabor.toLocaleString()}</span>}
                      </div>
                      <div className="flex justify-end gap-1 whitespace-nowrap">
                        <span className="text-zinc-400">{(item.expenseUnitPrice * item.quantity).toLocaleString()}</span>
                        {actualExpense > 0 && <span className="text-emerald-600 font-bold">- {actualExpense.toLocaleString()}</span>}
                      </div>
                    </div>
                    <div className="mt-1 border-t border-zinc-100 dark:border-zinc-800 pt-1 flex justify-end gap-1 whitespace-nowrap">
                      <span className={totalActual > item.amount ? "text-red-500" : ""}>{item.amount.toLocaleString()}</span>
                      {totalActual > 0 && (
                        <span className={`font-bold ${totalActual > item.amount ? "text-red-600" : "text-emerald-600"}`}>
                          - {totalActual.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  {onMapToSpendingRequest && (
                    <td className="px-2 py-1.5 text-center">
                      <button
                        onClick={() => onMapToSpendingRequest(item)}
                        className="p-1.5 rounded-md text-zinc-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                        title="지출결의서로 매핑"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              );
            });
          })}
        </tbody>
        <tfoot className="sticky bottom-0 z-10">
          <tr className="border-t-2 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800">
            <td colSpan={2} className="px-2 py-2 text-right font-semibold text-zinc-900 dark:text-zinc-100 text-xs leading-tight">
              합계
            </td>
            <td className="px-2 py-2 text-right font-mono text-[8px] leading-tight whitespace-nowrap">
              <div className="flex justify-end gap-1 whitespace-nowrap">
                <span className="text-zinc-500 dark:text-zinc-400">재: {totalMaterial.toLocaleString()}</span>
                {grandTotalActualMaterial > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-bold">- {grandTotalActualMaterial.toLocaleString()}</span>}
              </div>
              <div className="flex justify-end gap-1 whitespace-nowrap">
                <span className="text-zinc-500 dark:text-zinc-400">노: {totalLabor.toLocaleString()}</span>
                {grandTotalActualLabor > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-bold">- {grandTotalActualLabor.toLocaleString()}</span>}
              </div>
              <div className="flex justify-end gap-1 whitespace-nowrap">
                <span className="text-zinc-500 dark:text-zinc-400">경: {totalExpense.toLocaleString()}</span>
                {grandTotalActualExpense > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-bold">- {grandTotalActualExpense.toLocaleString()}</span>}
              </div>
            </td>
            <td className="px-2 py-2 text-right font-mono font-bold text-xs leading-tight whitespace-nowrap">
              <div className="flex flex-col items-end whitespace-nowrap">
                <span className="text-indigo-600 dark:text-indigo-400">{totalAmount.toLocaleString()}</span>
                {grandTotalActual > 0 && (
                  <span className={`${grandTotalActual > totalAmount ? "text-red-600" : "text-emerald-600 dark:text-emerald-400"} whitespace-nowrap`}>
                    실: {grandTotalActual.toLocaleString()}
                  </span>
                )}
              </div>
            </td>
            {onMapToSpendingRequest && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
