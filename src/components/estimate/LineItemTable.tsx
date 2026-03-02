import { useState, Fragment } from "react";
import type { EstimateLineItem, SpendingRequestItem, SpendingFilter, AdditionalLineItem } from "@/types/estimate";

const FilterIcon = () => (
// ... existing FilterIcon ...
  <svg className="w-3.5 h-3.5 ml-1 text-zinc-400 group-hover:text-zinc-500 transition-colors cursor-pointer inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

export function LineItemTable({ 
  items,
  onItemChange,
  onAddItem,
  onDeleteItem,
  spendingRequests = [],
  additionalLineItems = [],
  onAdditionalItemChange,
  onDeleteAdditionalItem,
  onMapToSpendingRequest,
  onMapToAdditionalItem,
  activeFilter,
  onFilterChange,
}: { 
  items: EstimateLineItem[];
  onItemChange: (id: string, field: keyof EstimateLineItem, value: any) => void;
  onAddItem: (newItem: Omit<EstimateLineItem, "id" | "amount">) => void;
  onDeleteItem: (id: string) => void;
  spendingRequests?: SpendingRequestItem[];
  additionalLineItems?: AdditionalLineItem[];
  onAdditionalItemChange?: (id: string, field: keyof AdditionalLineItem, value: any) => void;
  onDeleteAdditionalItem?: (id: string) => void;
  onMapToSpendingRequest?: (item: EstimateLineItem) => void;
  onMapToAdditionalItem?: (item: EstimateLineItem) => void;
  activeFilter?: SpendingFilter;
  onFilterChange?: (filter: SpendingFilter) => void;
}) {
  const [newItem, setNewItem] = useState<Omit<EstimateLineItem, "id" | "amount" | "unitPrice">>({
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
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null); // id for existing item
  const [tempNote, setTempNote] = useState("");
  const [hoveredContent, setHoveredContent] = useState<{ text: string; x: number; y: number } | null>(null);

  const categories = Array.from(new Set(items.map((item) => item.category)));

  const totalMaterial = items.reduce((sum, item) => sum + (item.materialUnitPrice * item.quantity), 0);
  const totalLabor = items.reduce((sum, item) => sum + (item.laborUnitPrice * item.quantity), 0);
  const totalExpense = items.reduce((sum, item) => sum + (item.expenseUnitPrice * item.quantity), 0);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const grandTotalActualMaterial = spendingRequests.reduce((sum, r) => sum + (r.materialActualCost || 0), 0);
  const grandTotalActualLabor = spendingRequests.reduce((sum, r) => sum + (r.laborActualCost || 0), 0);
  const grandTotalActualExpense = spendingRequests.reduce((sum, r) => sum + (r.expenseActualCost || 0), 0);
  const grandTotalActual = grandTotalActualMaterial + grandTotalActualLabor + grandTotalActualExpense;

  const handleAddNewItem = () => {
    if (newItem.name || newItem.category) {
      const unitPrice = Number(newItem.materialUnitPrice || 0) + 
                        Number(newItem.laborUnitPrice || 0) + 
                        Number(newItem.expenseUnitPrice || 0);
      onAddItem({ ...newItem, unitPrice } as any);
      setNewItem({
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

  const openNoteEditor = (id: string, initialNote: string) => {
    setActiveNoteId(id);
    setTempNote(initialNote || "");
  };

  const saveNote = () => {
    if (activeNoteId) {
      onItemChange(activeNoteId, "note", tempNote);
    }
    setActiveNoteId(null);
  };

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

      {/* Note Editor Overlay */}
      {activeNoteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                비고 작성
              </h3>
              <button onClick={() => setActiveNoteId(null)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <textarea
                autoFocus
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                placeholder="내용을 입력하세요..."
                className="w-full h-40 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all dark:text-zinc-100"
              />
            </div>
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
              <button
                onClick={() => setActiveNoteId(null)}
                className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveNote}
                className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
              >
                저장 완료
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-50 dark:bg-zinc-800">
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-8 text-center">No</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-20 group">
              <div className="flex items-center">공정 <FilterIcon /></div>
            </th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-24 group">
              <div className="flex items-center">세부공정 <FilterIcon /></div>
            </th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider min-w-[200px]">
              <div className="flex items-center">품목명</div>
            </th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center w-14">단위</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right w-16">수량</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center w-64">
              단가 (재료 / 노무 / 경비)
            </th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right w-28">금액</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center w-10">비고</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {/* New Line Item Input Row */}
          <tr className="border-b-2 border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10 transition-colors">
            <td className="px-2 py-2 text-center text-indigo-400 font-bold">+</td>
            <td className="px-2 py-2">
              <input
                type="text"
                placeholder="공정..."
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </td>
            <td className="px-2 py-2">
              <input
                type="text"
                placeholder="세부..."
                value={newItem.subCategory}
                onChange={(e) => setNewItem({ ...newItem, subCategory: e.target.value })}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </td>
            <td className="px-2 py-2">
              <input
                type="text"
                placeholder="품목명 입력..."
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </td>
            <td className="px-2 py-2 text-center text-zinc-500 text-xs">
              {newItem.unit}
            </td>
            <td className="px-2 py-2">
              <input
                type="number"
                placeholder="0"
                value={newItem.quantity || ""}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-xs text-right font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </td>
            <td className="px-2 py-2">
              <div className="flex gap-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-0.5 shadow-sm">
                <input
                  type="number"
                  placeholder="재료"
                  value={newItem.materialUnitPrice || ""}
                  onChange={(e) => setNewItem({ ...newItem, materialUnitPrice: Number(e.target.value) })}
                  className="w-full bg-transparent border-none focus:ring-0 px-1 py-0.5 text-right text-[10px] font-mono"
                  title="재료비"
                />
                <input
                  type="number"
                  placeholder="노무"
                  value={newItem.laborUnitPrice || ""}
                  onChange={(e) => setNewItem({ ...newItem, laborUnitPrice: Number(e.target.value) })}
                  className="w-full bg-transparent border-none focus:ring-0 px-1 py-0.5 text-right text-[10px] font-mono border-l border-zinc-100 dark:border-zinc-700"
                  title="노무비"
                />
                <input
                  type="number"
                  placeholder="경비"
                  value={newItem.expenseUnitPrice || ""}
                  onChange={(e) => setNewItem({ ...newItem, expenseUnitPrice: Number(e.target.value) })}
                  className="w-full bg-transparent border-none focus:ring-0 px-1 py-0.5 text-right text-[10px] font-mono border-l border-zinc-100 dark:border-zinc-700"
                  title="경비"
                />
              </div>
            </td>
            <td className="px-2 py-2 text-right font-mono font-medium text-indigo-600 dark:text-indigo-400">
              {((Number(newItem.materialUnitPrice || 0) + Number(newItem.laborUnitPrice || 0) + Number(newItem.expenseUnitPrice || 0)) * Number(newItem.quantity || 0)).toLocaleString()}
            </td>
            <td className="px-2 py-2 text-center">
              <button
                onClick={() => {
                  const note = prompt("비고 내용을 입력하세요", newItem.note);
                  if (note !== null) setNewItem({ ...newItem, note });
                }}
                className={`p-1.5 rounded transition-colors ${newItem.note ? 'text-indigo-600 bg-indigo-50' : 'text-zinc-300 hover:bg-zinc-100'}`}
                title={newItem.note || "비고 입력"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </td>
            <td className="px-2 py-2 text-center">
              <button
                onClick={handleAddNewItem}
                className="p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </td>
          </tr>
          {categories.map((cat) => {
            const catItems = items.filter((item) => item.category === cat);
            const subtotal = catItems.reduce((sum, item) => sum + item.amount, 0);

            // Calculate total rows for category (including matched additional items)
            const catTotalRows = catItems.reduce((acc, item) => {
              const matchedAI = additionalLineItems.filter(ai => ai.name === item.name);
              return acc + 1 + matchedAI.length;
            }, 0);

            return catItems.map((item, idx) => {
              const subCatItems = catItems.filter((i) => i.subCategory === item.subCategory);
              const isFirstInSubCat = catItems.findIndex((i) => i.subCategory === item.subCategory) === idx;
              const subCatTotal = subCatItems.reduce((sum, i) => sum + i.amount, 0);

              // Calculate total rows for subcategory
              const subCatTotalRows = subCatItems.reduce((acc, i) => {
                const matchedAI = additionalLineItems.filter(ai => ai.name === i.name);
                return acc + 1 + matchedAI.length;
              }, 0);

              const matchedRequests = spendingRequests.filter(
                (r) => r.processName === item.category && 
                       r.subProcessName === item.subCategory && 
                       r.itemName === item.name
              );

              const actualMaterial = matchedRequests.reduce((sum, r) => sum + (r.materialActualCost || 0), 0);
              const actualLabor = matchedRequests.reduce((sum, r) => sum + (r.laborActualCost || 0), 0);
              const actualExpense = matchedRequests.reduce((sum, r) => sum + (r.expenseActualCost || 0), 0);
              const totalActual = actualMaterial + actualLabor + actualExpense;

              const matchedAI = additionalLineItems.filter(ai => ai.name === item.name);

              return (
                <Fragment key={item.id}>
                  <tr
                    className={`border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                      activeFilter?.type === 'vendorName' && matchedRequests.some(r => r.vendorName === activeFilter.value)
                        ? "bg-emerald-50 dark:bg-emerald-900/20"
                        : ""
                    }`}
                  >
                    <td className="px-2 py-1.5 text-zinc-400 font-mono text-xs">{item.id}</td>
                    {idx === 0 ? (
                      <td
                        rowSpan={catTotalRows}
                        onClick={() => handleFilterClick('category', item.category)}
                        className={`px-2 py-1.5 font-medium text-zinc-900 dark:text-zinc-100 align-top cursor-pointer transition-colors w-24 ${
                          activeFilter?.type === 'category' && activeFilter?.value === item.category
                            ? "bg-emerald-100 dark:bg-emerald-900/40"
                            : "bg-zinc-50/50 dark:bg-zinc-800/30"
                        }`}
                      >
                        <input
                          type="text"
                          value={item.category}
                          title={item.category}
                          onChange={(e) => onItemChange(item.id, "category", e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 py-0.5 font-medium"
                        />
                        <div className="text-[10px] text-zinc-400 mt-1 font-normal leading-tight">
                          공정 소계:<br />{subtotal.toLocaleString()}원
                        </div>
                      </td>
                    ) : null}
                    {isFirstInSubCat ? (
                      <td
                        rowSpan={subCatTotalRows}
                        onClick={() => handleFilterClick('subCategory', item.subCategory)}
                        className={`px-2 py-1.5 align-top border-l border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors w-24 ${
                          activeFilter?.type === 'subCategory' && activeFilter?.value === item.subCategory
                            ? "bg-emerald-100 dark:bg-emerald-900/40"
                            : "bg-zinc-50/20 dark:bg-zinc-800/10"
                        }`}
                      >
                        <input
                          type="text"
                          value={item.subCategory}
                          title={item.subCategory}
                          onChange={(e) => onItemChange(item.id, "subCategory", e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 py-0.5 text-zinc-600 dark:text-zinc-400"
                        />
                        <div className="text-[10px] text-zinc-400 mt-1 font-normal leading-tight">
                          세부 소계:<br />{subCatTotal.toLocaleString()}원
                        </div>
                      </td>
                    ) : null}
                    <td 
                      className={`px-2 py-1.5 cursor-pointer transition-colors ${
                        activeFilter?.type === 'itemName' && activeFilter?.value === item.name
                          ? "bg-emerald-100 dark:bg-emerald-900/40"
                          : ""
                      }`}
                      onClick={() => handleFilterClick('itemName', item.name)}
                    >
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => onItemChange(item.id, "name", e.target.value)}
                        onMouseEnter={(e) => setHoveredContent({ text: item.name, x: e.clientX, y: e.clientY })}
                        onMouseMove={(e) => setHoveredContent({ text: item.name, x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHoveredContent(null)}
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 py-0.5 text-zinc-900 dark:text-zinc-100"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center text-zinc-500 text-xs">
                      {item.unit}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onItemChange(item.id, "quantity", Number(e.target.value))}
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 text-right text-zinc-900 dark:text-zinc-100"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono">
                      <div className="flex gap-1 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 rounded transition-colors p-0.5">
                        <input
                          type="number"
                          value={item.materialUnitPrice}
                          onChange={(e) => onItemChange(item.id, "materialUnitPrice", Number(e.target.value))}
                          className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 text-right text-xs text-zinc-900 dark:text-zinc-100"
                          title="재료비"
                          placeholder="재료"
                        />
                        <input
                          type="number"
                          value={item.laborUnitPrice}
                          onChange={(e) => onItemChange(item.id, "laborUnitPrice", Number(e.target.value))}
                          className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 text-right text-xs text-zinc-900 dark:text-zinc-100 border-l border-zinc-200 dark:border-zinc-700"
                          title="노무비"
                          placeholder="노무"
                        />
                        <input
                          type="number"
                          value={item.expenseUnitPrice}
                          onChange={(e) => onItemChange(item.id, "expenseUnitPrice", Number(e.target.value))}
                          className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 text-right text-xs text-zinc-900 dark:text-zinc-100 border-l border-zinc-200 dark:border-zinc-700"
                          title="경비"
                          placeholder="경비"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      <div className="flex flex-col text-[10px] leading-tight">
                        <div className="flex justify-end gap-2">
                          <span className="text-zinc-400">{(item.materialUnitPrice * item.quantity).toLocaleString()}</span>
                          {actualMaterial > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-bold">- {actualMaterial.toLocaleString()}</span>}
                        </div>
                        <div className="flex justify-end gap-2">
                          <span className="text-zinc-400">{(item.laborUnitPrice * item.quantity).toLocaleString()}</span>
                          {actualLabor > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-bold">- {actualLabor.toLocaleString()}</span>}
                        </div>
                        <div className="flex justify-end gap-2">
                          <span className="text-zinc-400">{(item.expenseUnitPrice * item.quantity).toLocaleString()}</span>
                          {actualExpense > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-bold">- {actualExpense.toLocaleString()}</span>}
                        </div>
                      </div>
                      <div className="mt-1 border-t border-zinc-100 dark:border-zinc-800 pt-1 flex justify-end gap-2">
                        <span className={totalActual > item.amount ? "text-red-500" : ""}>{item.amount.toLocaleString()}</span>
                        {totalActual > 0 && (
                          <span className={`font-bold ${totalActual > item.amount ? "text-red-600" : "text-emerald-600 dark:text-emerald-400"}`}>
                            - {totalActual.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button
                        onClick={() => openNoteEditor(item.id, item.note)}
                        onMouseEnter={(e) => item.note && setHoveredContent({ text: item.note, x: e.clientX, y: e.clientY })}
                        onMouseMove={(e) => item.note && setHoveredContent({ text: item.note, x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHoveredContent(null)}
                        className={`p-2 rounded-lg transition-all ${
                          item.note 
                            ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 shadow-sm" 
                            : "text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                        title={item.note || "비고 작성"}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onMapToAdditionalItem && (
                          <button
                            onClick={() => onMapToAdditionalItem(item)}
                            className="p-1.5 rounded-md text-zinc-300 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                            title="추가 견적서로 매핑"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                        {onMapToSpendingRequest && (
                          <button
                            onClick={() => onMapToSpendingRequest(item)}
                            className="p-1.5 rounded-md text-zinc-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                            title="지출결의서로 매핑"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-md text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {matchedAI.map(ai => (
                    <tr key={ai.id} className="bg-purple-50/20 dark:bg-purple-900/10 border-b border-purple-100/50 dark:border-purple-800/30 text-purple-700 dark:text-purple-300 group">
                      <td className="px-2 py-1 text-purple-400 font-mono text-[10px] text-center">추가</td>
                      <td className="px-2 py-1">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-xs font-semibold">추가 견적</span>
                        </div>
                      </td>
                      <td className="px-2 py-1" colSpan={2}>
                        <div className="flex items-center justify-end gap-1 font-mono text-xs">
                          <span className="text-purple-400/70 text-[10px]">({ai.requestDate})</span>
                        </div>
                      </td>
                      <td className="px-2 py-1 text-right font-mono text-xs" colSpan={2}>
                        <div className="flex gap-1 bg-white/50 dark:bg-zinc-800/50 border border-purple-200 dark:border-purple-700 rounded p-0.5 shadow-sm">
                          <input
                            type="number"
                            placeholder="재료"
                            value={ai.materialCost || ""}
                            onChange={(e) => onAdditionalItemChange && onAdditionalItemChange(ai.id, "materialCost", Number(e.target.value))}
                            className="w-full bg-transparent border-none focus:ring-0 px-1 py-0.5 text-right text-[10px] font-mono text-purple-700 dark:text-purple-300"
                            title="추가 재료비"
                          />
                          <input
                            type="number"
                            placeholder="노무"
                            value={ai.laborCost || ""}
                            onChange={(e) => onAdditionalItemChange && onAdditionalItemChange(ai.id, "laborCost", Number(e.target.value))}
                            className="w-full bg-transparent border-none focus:ring-0 px-1 py-0.5 text-right text-[10px] font-mono text-purple-700 dark:text-purple-300 border-l border-purple-100 dark:border-purple-700"
                            title="추가 노무비"
                          />
                          <input
                            type="number"
                            placeholder="경비"
                            value={ai.expense || ""}
                            onChange={(e) => onAdditionalItemChange && onAdditionalItemChange(ai.id, "expense", Number(e.target.value))}
                            className="w-full bg-transparent border-none focus:ring-0 px-1 py-0.5 text-right text-[10px] font-mono text-purple-700 dark:text-purple-300 border-l border-purple-100 dark:border-purple-700"
                            title="추가 경비"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-1 text-right font-mono font-bold text-xs">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-normal text-purple-400/70">+</span>
                            <span>{ai.additionalAmount.toLocaleString()}</span>
                          </div>
                          <div className="text-[9px] text-purple-400/50 font-normal">
                            기존: {ai.originalAmount.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1 text-center" colSpan={2}>
                        {onDeleteAdditionalItem && (
                          <button
                            onClick={() => onDeleteAdditionalItem(ai.id)}
                            className="p-1 rounded text-purple-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                            title="추가 견적 삭제"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              );
            });
          })}
        </tbody>
        <tfoot className="sticky bottom-0 z-10">
          <tr className="border-t-2 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800">
            <td colSpan={6} className="px-2 py-2 text-right font-semibold text-zinc-900 dark:text-zinc-100">
              합계
            </td>
            <td className="px-2 py-2 text-right font-mono text-[10px] leading-tight">
              <div className="flex justify-end gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">재료: {totalMaterial.toLocaleString()}원</span>
                {grandTotalActualMaterial > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-bold">- {grandTotalActualMaterial.toLocaleString()}원</span>}
              </div>
              <div className="flex justify-end gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">노무: {totalLabor.toLocaleString()}원</span>
                {grandTotalActualLabor > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-bold">- {grandTotalActualLabor.toLocaleString()}원</span>}
              </div>
              <div className="flex justify-end gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">경비: {totalExpense.toLocaleString()}원</span>
                {grandTotalActualExpense > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-bold">- {grandTotalActualExpense.toLocaleString()}원</span>}
              </div>
            </td>
            <td className="px-2 py-2 text-right font-mono font-bold text-base leading-tight">
              <div className="flex flex-col items-end">
                <span className="text-indigo-600 dark:text-indigo-400">{totalAmount.toLocaleString()}</span>
                {grandTotalActual > 0 && (
                  <span className={`text-sm ${grandTotalActual > totalAmount ? "text-red-600" : "text-emerald-600 dark:text-emerald-400"}`}>
                    실행: {grandTotalActual.toLocaleString()}
                  </span>
                )}
              </div>
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
