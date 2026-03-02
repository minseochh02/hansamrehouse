import { useState } from "react";
import type { SpendingRequestItem, EstimateLineItem, SpendingFilter } from "@/types/estimate";
import { SpendingRequestDrawer } from "./SpendingRequestDrawer";

const FilterIcon = () => (
  <svg className="w-3.5 h-3.5 ml-1 text-zinc-400 group-hover:text-zinc-500 transition-colors cursor-pointer inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

export function SpendingRequestTable({ 
  items,
  onItemChange,
  onAddItem,
  onDeleteItem,
  onOpenDrawer,
  activeFilter,
  onFilterChange,
}: { 
  items: SpendingRequestItem[];
  lineItems?: EstimateLineItem[];
  onItemChange: (id: string, field: keyof SpendingRequestItem, value: any) => void;
  onAddItem: (newItem: Omit<SpendingRequestItem, "id">) => void;
  onDeleteItem: (id: string) => void;
  isOpen: boolean;
  editingItem: SpendingRequestItem | null;
  onOpenDrawer: (item: SpendingRequestItem | null) => void;
  onCloseDrawer: () => void;
  activeFilter?: SpendingFilter;
  onFilterChange?: (filter: SpendingFilter) => void;
}) {
  const [hoveredContent, setHoveredContent] = useState<{ text: string; x: number; y: number } | null>(null);

  const filteredItems = items.filter((item) => {
    if (!activeFilter || activeFilter.type === 'none') return true;
    if (activeFilter.type === 'category') return item.processName === activeFilter.value;
    if (activeFilter.type === 'subCategory') return item.subProcessName === activeFilter.value;
    if (activeFilter.type === 'itemName') return item.itemName === activeFilter.value;
    if (activeFilter.type === 'vendorName') return item.vendorName === activeFilter.value;
    return true;
  });

  const handleFilterClick = (type: SpendingFilter['type'], value: string) => {
    if (!onFilterChange) return;
    if (activeFilter?.type === type && activeFilter?.value === value) {
      onFilterChange({ type: 'none', value: '' });
    } else {
      onFilterChange({ type, value });
    }
  };

  const totalActual = filteredItems.reduce((sum, item) => sum + (item.totalSpendingActual || 0), 0);

  return (
    <div className="flex flex-col h-full relative">
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-50/50 dark:bg-zinc-800/20">
              <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <div className="flex items-center">품목명</div>
              </th>
              <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider group">
                <div className="flex items-center">협력업체 <FilterIcon /></div>
              </th>
              <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">지출결의합계</th>
              <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-20 text-center">상태</th>
              <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-20 text-center">긴급</th>
              <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-12 text-center text-zinc-400 dark:text-zinc-500 italic">
                  {activeFilter && activeFilter.type !== 'none' 
                    ? `"${activeFilter.value}"에 해당하는 지출 요청 내역이 없습니다.`
                    : "지출 요청 내역이 없습니다."}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="group bg-blue-50/30 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer border-l-2 border-blue-500 shadow-sm mb-1"
                  onClick={() => onOpenDrawer(item)}
                >
                  <td 
                    className={`px-2 py-2 text-zinc-600 dark:text-zinc-400 cursor-help transition-colors ${
                      activeFilter?.type === 'itemName' && activeFilter?.value === item.itemName
                        ? "bg-blue-100 dark:bg-blue-900/40"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFilterClick('itemName', item.itemName);
                    }}
                    onMouseEnter={(e) => setHoveredContent({ text: item.itemName, x: e.clientX, y: e.clientY })}
                    onMouseMove={(e) => setHoveredContent({ text: item.itemName, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setHoveredContent(null)}
                  >
                    <div className="flex items-center gap-1.5">
                      {item.isAdditional && (
                        <span className="shrink-0 text-[9px] bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 px-1 py-0.5 rounded font-bold border border-purple-200 dark:border-purple-800">
                          추가
                        </span>
                      )}
                      <div className="truncate max-w-[200px] font-medium text-blue-900 dark:text-blue-100">{item.itemName}</div>
                    </div>
                  </td>
                  <td 
                    className={`px-2 py-2 text-zinc-600 dark:text-zinc-100 font-medium cursor-help transition-colors ${
                      activeFilter?.type === 'vendorName' && activeFilter?.value === item.vendorName
                        ? "bg-blue-100 dark:bg-blue-900/40"
                        : ""
                    }`}
                    onClick={(e) => {
                      if (item.vendorName) {
                        e.stopPropagation();
                        handleFilterClick('vendorName', item.vendorName);
                      }
                    }}
                    onMouseEnter={(e) => item.vendorName && setHoveredContent({ text: item.vendorName, x: e.clientX, y: e.clientY })}
                    onMouseMove={(e) => item.vendorName && setHoveredContent({ text: item.vendorName, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setHoveredContent(null)}
                  >
                    <div className="truncate max-w-[120px]">{item.vendorName || "-"}</div>
                  </td>
                  <td className="px-2 py-2 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                    {(item.totalSpendingActual || 0).toLocaleString()}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border transition-colors ${
                      item.paymentStatus === '완료' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:border-blue-800' :
                      item.paymentStatus === '반려' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:border-red-800' :
                      item.paymentStatus === '임시저장' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:border-amber-800' :
                      'bg-zinc-50 text-zinc-400 border-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-700'
                    }`}>
                      {item.paymentStatus === '완료' ? '결제완료' :
                       item.paymentStatus === '반려' ? '반려됨' : 
                       item.paymentStatus === '임시저장' ? '임시저장' : '결제대기'}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    {item.isUrgentToday && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-600 dark:bg-red-900/20">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      className="p-1.5 rounded-md text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="sticky bottom-0 z-10">
            <tr className="border-t-2 border-zinc-300 dark:border-zinc-600 bg-blue-50/50 dark:bg-blue-900/20">
              <td colSpan={3} className="px-2 py-4 text-right font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wider">
                지출 합계 (지출결의)
              </td>
              <td className="px-2 py-4 text-right font-mono font-bold text-lg text-blue-600 dark:text-blue-400">
                {totalActual.toLocaleString()} <span className="text-xs ml-1 font-bold text-blue-500">원</span>
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
