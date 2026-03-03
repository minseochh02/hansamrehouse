import React, { useState, Fragment, useEffect } from "react";
import type { SpendingRequestItem, EstimateLineItem, SpendingFilter, AdditionalLineItem, MasterCategory, MasterSubCategory, MasterItem } from "@/types/estimate";
import { apiFetch } from "@/lib/api";

const FilterIcon = () => (
  <svg className="w-3 h-3 ml-1 text-zinc-400 group-hover:text-zinc-500 transition-colors cursor-pointer inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

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
  
  // Master data state
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>([]);
  const [masterSubCategories, setMasterSubCategories] = useState<MasterSubCategory[]>([]);
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [catsRes, subsRes, itemsRes] = await Promise.all([
        apiFetch("/api/categories"),
        apiFetch("/api/subcategories"),
        apiFetch("/api/items"),
      ]);

      if (catsRes.ok) setMasterCategories(await catsRes.json());
      if (subsRes.ok) setMasterSubCategories(await subsRes.json());
      if (itemsRes.ok) setMasterItems(await itemsRes.json());
    } catch (error) {
      console.error("Failed to fetch master data:", error);
    }
  };

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

  const handleFilterClick = (type: SpendingFilter['type'], value: string) => {
    if (!onFilterChange) return;
    if (activeFilter?.type === type && activeFilter?.value === value) {
      onFilterChange({ type: 'none', value: '' });
    } else {
      onFilterChange({ type, value });
    }
  };

  const categories = Array.from(new Set(lineItems.map((item) => item.category))).sort();
  const totalEstimate = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0) + (additionalLineItems || []).reduce((sum, item) => sum + (item.additionalAmount || 0), 0);
  const totalActual = spendingRequests.reduce((sum, item) => sum + (item.totalSpendingActual || 0), 0);

  return (
    <div className="flex flex-col relative overflow-hidden bg-white dark:bg-zinc-950 font-sans">
      {hoveredContent && (
        <div className="fixed z-[9999] pointer-events-none bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-2 rounded-lg shadow-2xl text-[10px] max-w-xs break-words animate-in fade-in zoom-in-95 duration-100" style={{ left: hoveredContent.x + 15, top: hoveredContent.y + 15 }}>
          {hoveredContent.text}
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-[11px] border-collapse min-w-[1300px]">
          <thead className="sticky top-0 z-20">
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left bg-zinc-100 dark:bg-zinc-900 shadow-sm">
              <th className="px-2 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight w-10 text-center">No</th>
              <th className="px-2 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight w-24">공정명</th>
              <th className="px-2 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight w-32">세부공정명</th>
              <th className="px-2 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight min-w-[250px]">품목명 / 날짜 / 업체 / 상태</th>
              <th className="px-2 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight text-center w-12">단위</th>
              <th className="px-2 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight text-right w-14">수량</th>
              <th className="px-2 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight text-center w-40">단가 (재료/노무/경비)</th>
              <th className="px-2 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight text-right w-24">합계 (원)</th>
              <th className="px-2 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight w-12 text-center">비고/긴급</th>
              <th className="px-2 py-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight w-24 text-center">지출/추가 등록</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
            <tr className="border-b border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/5 dark:bg-indigo-900/5">
              <td className="px-2 py-1 text-center text-indigo-400 font-bold">+</td>
              <td className="px-2 py-1">
                <input 
                  list="categories-list"
                  type="text" 
                  placeholder="공정명..." 
                  value={newEstimateItem.category} 
                  onChange={(e) => {
                    const category = e.target.value;
                    setNewEstimateItem({ ...newEstimateItem, category });
                  }} 
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5 text-[10px] focus:ring-1 focus:ring-indigo-500 outline-none" 
                />
                <datalist id="categories-list">
                  {masterCategories.map(cat => <option key={cat.id} value={cat.name} />)}
                </datalist>
              </td>
              <td className="px-2 py-1">
                <input 
                  list="subcategories-list"
                  type="text" 
                  placeholder="세부공정명..." 
                  value={newEstimateItem.subCategory} 
                  onChange={(e) => {
                    const subCategory = e.target.value;
                    setNewEstimateItem({ ...newEstimateItem, subCategory });
                  }} 
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5 text-[10px] focus:ring-1 focus:ring-indigo-500 outline-none" 
                />
                <datalist id="subcategories-list">
                  {masterSubCategories
                    .filter(sub => !newEstimateItem.category || sub.categoryId === newEstimateItem.category)
                    .map(sub => <option key={sub.id} value={sub.name} />)
                  }
                </datalist>
              </td>
              <td className="px-2 py-1">
                <input 
                  list="items-list"
                  type="text" 
                  placeholder="품목명 입력..." 
                  value={newEstimateItem.name} 
                  onChange={(e) => {
                    const name = e.target.value;
                    const matchedItem = masterItems.find(i => i.itemName === name);
                    if (matchedItem) {
                      setNewEstimateItem({ 
                        ...newEstimateItem, 
                        name,
                        unit: matchedItem.unit || newEstimateItem.unit,
                        category: matchedItem.processName || newEstimateItem.category,
                        subCategory: matchedItem.subProcessName || newEstimateItem.subCategory
                      });
                    } else {
                      setNewEstimateItem({ ...newEstimateItem, name });
                    }
                  }} 
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5 text-[10px] focus:ring-1 focus:ring-indigo-500 outline-none font-bold" 
                />
                <datalist id="items-list">
                  {masterItems
                    .filter(item => 
                      (!newEstimateItem.category || item.processName === newEstimateItem.category) &&
                      (!newEstimateItem.subCategory || item.subProcessName === newEstimateItem.subCategory)
                    )
                    .map(item => <option key={item.id} value={item.itemName} />)
                  }
                </datalist>
              </td>
              <td className="px-2 py-1">
                <div className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5 text-[10px] text-center text-zinc-500 font-medium">
                  {newEstimateItem.unit}
                </div>
              </td>
              <td className="px-2 py-1"><input type="number" placeholder="0" value={newEstimateItem.quantity || ""} onChange={(e) => setNewEstimateItem({ ...newEstimateItem, quantity: Number(e.target.value) })} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5 text-[10px] text-right font-mono focus:ring-1 focus:ring-indigo-500 outline-none" /></td>
              <td className="px-2 py-1">
                <div className="flex gap-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-0.5 shadow-sm">
                  <input type="number" placeholder="재료" value={newEstimateItem.materialUnitPrice || ""} onChange={(e) => setNewEstimateItem({ ...newEstimateItem, materialUnitPrice: Number(e.target.value) })} className="w-full bg-transparent border-none focus:ring-0 px-0.5 py-0.5 text-right text-[9px] font-mono" />
                  <input type="number" placeholder="노무" value={newEstimateItem.laborUnitPrice || ""} onChange={(e) => setNewEstimateItem({ ...newEstimateItem, laborUnitPrice: Number(e.target.value) })} className="w-full bg-transparent border-none focus:ring-0 px-0.5 py-0.5 text-right text-[9px] font-mono border-l border-zinc-100" />
                  <input type="number" placeholder="경비" value={newEstimateItem.expenseUnitPrice || ""} onChange={(e) => setNewEstimateItem({ ...newEstimateItem, expenseUnitPrice: Number(e.target.value) })} className="w-full bg-transparent border-none focus:ring-0 px-0.5 py-0.5 text-right text-[9px] font-mono border-l border-zinc-100" />
                </div>
              </td>
              <td className="px-2 py-1 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">{((Number(newEstimateItem.materialUnitPrice || 0) + Number(newEstimateItem.laborUnitPrice || 0) + Number(newEstimateItem.expenseUnitPrice || 0)) * Number(newEstimateItem.quantity || 0)).toLocaleString()}</td>
              <td className="py-1"></td>
              <td className="px-2 py-1 text-center"><button onClick={handleAddLineItem} className="p-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg></button></td>
            </tr>

            {categories.map((cat) => {
              const catItems = lineItems.filter(item => item.category === cat);
              const catSubtotal = catItems.reduce((sum, item) => sum + (item.amount || 0), 0);
              return (
                <Fragment key={cat}>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
                    <td colSpan={10} className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                        <span className="flex items-center gap-2 cursor-pointer hover:text-emerald-600" onClick={() => handleFilterClick('category', cat)}>{cat}<FilterIcon /></span>
                        <span>소계: {catSubtotal.toLocaleString()}원</span>
                      </div>
                    </td>
                  </tr>
                  {catItems.map((lineItem) => {
                    const itemRequests = spendingRequests.filter(req => req.lineItemId === lineItem.id);
                    const itemAdditions = additionalLineItems.filter(ai => ai.name === lineItem.name);
                    return (
                      <Fragment key={lineItem.id}>
                        <tr className="bg-white dark:bg-zinc-900 group border-b border-zinc-50 dark:border-zinc-800">
                          <td className="px-2 py-1 text-center text-zinc-400 font-mono text-[10px]">{lineItem.id}</td>
                          <td className="px-2 py-1 text-[10px] text-zinc-400 font-bold">{cat}</td>
                          <td className="px-2 py-1"><input type="text" value={lineItem.subCategory} onChange={(e) => onLineItemChange?.(lineItem.id, "subCategory", e.target.value)} className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 text-[10px] font-medium text-zinc-500" /></td>
                          <td className="px-2 py-1">
                            <div className="flex items-center gap-2">
                              <input type="text" value={lineItem.name} onChange={(e) => onLineItemChange?.(lineItem.id, "name", e.target.value)} className="w-full font-bold text-zinc-900 dark:text-zinc-100 bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 text-[11px]" />
                              <span className="shrink-0 text-[8px] bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-500 font-bold uppercase tracking-tighter">BUDGET</span>
                            </div>
                          </td>
                          <td className="px-2 py-1">
                            <div className="w-full text-center text-zinc-500 text-[10px] font-medium py-0.5">
                              {lineItem.unit}
                            </div>
                          </td>
                          <td className="px-2 py-1 text-right"><input type="number" value={lineItem.quantity} onChange={(e) => onLineItemChange?.(lineItem.id, "quantity", Number(e.target.value))} className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 text-right font-mono text-[10px] text-zinc-900 dark:text-zinc-100" /></td>
                          <td className="px-2 py-1">
                            <div className="flex gap-0.5 p-0.5">
                              <input type="number" value={lineItem.materialUnitPrice} onChange={(e) => onLineItemChange?.(lineItem.id, "materialUnitPrice", Number(e.target.value))} className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-0.5 py-0.5 text-right text-[9px] font-mono text-zinc-600" title="재료비 단가" />
                              <input type="number" value={lineItem.laborUnitPrice} onChange={(e) => onLineItemChange?.(lineItem.id, "laborUnitPrice", Number(e.target.value))} className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-0.5 py-0.5 text-right text-[9px] font-mono text-zinc-600 border-l border-zinc-100" title="노무비 단가" />
                              <input type="number" value={lineItem.expenseUnitPrice} onChange={(e) => onLineItemChange?.(lineItem.id, "expenseUnitPrice", Number(e.target.value))} className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-0.5 py-0.5 text-right text-[9px] font-mono text-zinc-600 border-l border-zinc-100" title="경비 단가" />
                            </div>
                          </td>
                          <td className="px-2 py-1 text-right font-mono font-bold text-zinc-700 dark:text-zinc-300">{lineItem.amount.toLocaleString()}</td>
                          <td className="px-2 py-1 text-center">{lineItem.note && <div className="p-1 text-indigo-500 cursor-help inline-flex" onMouseEnter={(e) => setHoveredContent({ text: lineItem.note, x: e.clientX, y: e.clientY })} onMouseLeave={() => setHoveredContent(null)}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>}</td>
                          <td className="px-2 py-1 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => onMapToSpendingRequest(lineItem)} className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm transition-all active:scale-90" title="지출결의서 추가"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></button>
                              <button onClick={() => onAddAdditionalItem?.({ requestDate: new Date().toISOString().split('T')[0], location: lineItem.subCategory || lineItem.category, name: lineItem.name, materialCost: 0, laborCost: 0, expense: 0, additionalAmount: 0, originalAmount: lineItem.amount })} className="p-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white shadow-sm transition-all active:scale-90" title="추가 견적서 추가"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                              <button onClick={() => onDeleteLineItem?.(lineItem.id)} className="p-1 text-zinc-300 hover:text-red-500 transition-all active:scale-90"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                          </td>
                        </tr>
                        {/* Child: Spending Requests */}
                        {itemRequests.map((req) => (
                          <tr key={req.id} className="bg-blue-50/20 dark:bg-blue-900/10 hover:bg-blue-50/40 transition-colors cursor-pointer border-l-4 border-l-blue-500 group/req" onClick={() => onOpenDrawer(req)}>
                            <td colSpan={3}></td>
                            <td className="px-2 py-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-500 font-mono shrink-0">{req.date}</span>
                                <span className="text-blue-900 dark:text-blue-100 font-bold truncate max-w-[120px]">{req.vendorName || "미정"}</span>
                                <span className="text-[8px] bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded text-blue-600 font-bold uppercase tracking-widest">Actual</span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${req.paymentStatus === '완료' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{req.paymentStatus}</span>
                              </div>
                            </td>
                            <td className="text-center text-zinc-300">-</td>
                            <td className="text-center text-zinc-300">-</td>
                            <td className="px-2 py-1.5">
                              <div className="flex gap-0.5 bg-blue-50/50 rounded p-0.5 text-[9px] font-mono text-zinc-500">
                                <div className="w-full text-right pr-0.5">{(req.materialActualCost || 0).toLocaleString()}</div>
                                <div className="w-full text-right pr-0.5 border-l border-blue-100">{(req.laborActualCost || 0).toLocaleString()}</div>
                                <div className="w-full text-right border-l border-blue-100">{(req.expenseActualCost || 0).toLocaleString()}</div>
                              </div>
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{(req.totalSpendingActual || 0).toLocaleString()}</td>
                            <td className="text-center">{req.isUrgentToday && <span className="text-red-500 text-[10px]">⚠</span>}</td>
                            <td className="px-2 py-1.5 text-right"><button onClick={(e) => { e.stopPropagation(); onDeleteItem(req.id); }} className="p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover/req:opacity-100"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                          </tr>
                        ))}
                        {/* Child: Additional Line Items and their Actuals */}
                        {itemAdditions.map((addItem) => {
                          const aiRequests = spendingRequests.filter(req => req.lineItemId === addItem.id && req.isAdditional);
                          return (
                            <Fragment key={addItem.id}>
                              <tr className="bg-purple-50/20 dark:bg-purple-900/10 border-l-4 border-l-purple-400 group/ai border-b border-purple-100 dark:border-purple-900">
                                <td colSpan={3}></td>
                                <td className="px-2 py-2">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <input type="text" value={addItem.name} onChange={(e) => onAdditionalItemChange?.(addItem.id, "name", e.target.value)} className="font-bold text-purple-900 dark:text-purple-100 bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 text-[10px] w-full" />
                                      <span className="shrink-0 text-[8px] bg-purple-100 text-purple-600 px-1 py-0.5 rounded font-bold uppercase tracking-widest">Additional</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[8px] text-purple-400"><span>{addItem.requestDate}</span> | <span>공간:</span><input type="text" value={addItem.location} onChange={(e) => onAdditionalItemChange?.(addItem.id, "location", e.target.value)} className="bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 text-[8px]" /></div>
                                  </div>
                                </td>
                                <td className="text-center text-zinc-300">-</td>
                                <td className="text-center text-zinc-300">-</td>
                                <td className="px-2 py-2">
                                  <div className="flex gap-0.5 bg-purple-50/50 rounded p-0.5 text-[9px] font-mono">
                                    <input type="number" value={addItem.materialCost} onChange={(e) => onAdditionalItemChange?.(addItem.id, "materialCost", Number(e.target.value))} className="w-full bg-transparent border-none focus:ring-0 text-right text-purple-600" />
                                    <input type="number" value={addItem.laborCost} onChange={(e) => onAdditionalItemChange?.(addItem.id, "laborCost", Number(e.target.value))} className="w-full bg-transparent border-none focus:ring-0 text-right text-purple-600 border-l border-purple-100" />
                                    <input type="number" value={addItem.expense} onChange={(e) => onAdditionalItemChange?.(addItem.id, "expense", Number(e.target.value))} className="w-full bg-transparent border-none focus:ring-0 text-right text-purple-600 border-l border-purple-100" />
                                  </div>
                                </td>
                                <td className="px-2 py-2 text-right font-mono font-bold text-purple-700 dark:text-purple-300">{addItem.additionalAmount.toLocaleString()}</td>
                                <td></td>
                                <td className="px-2 py-2 text-right flex items-center justify-end gap-1">
                                  <button onClick={() => onMapToAdditionalSpendingRequest?.(addItem)} className="p-1 rounded bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white shadow-sm opacity-0 group-hover/ai:opacity-100 transition-all"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></button>
                                  <button onClick={() => onDeleteAdditionalItem?.(addItem.id)} className="p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover/ai:opacity-100 transition-all"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </td>
                              </tr>
                              {aiRequests.map(req => (
                                <tr key={req.id} className="bg-purple-50/40 dark:bg-purple-900/5 hover:bg-purple-50/60 transition-colors cursor-pointer border-l-8 border-l-purple-300 group/aireq" onClick={() => onOpenDrawer(req)}>
                                  <td colSpan={3}></td>
                                  <td className="px-2 py-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-purple-400 font-mono shrink-0">{req.date}</span>
                                      <span className="text-purple-900 dark:text-purple-100 font-bold truncate max-w-[120px]">{req.vendorName || "미정"}</span>
                                      <span className="text-[8px] bg-purple-100 text-purple-600 px-1 py-0.5 rounded font-bold uppercase tracking-widest">Add-Actual</span>
                                    </div>
                                  </td>
                                  <td colSpan={2}></td>
                                  <td className="px-2 py-1.5">
                                    <div className="flex gap-0.5 bg-purple-50/30 rounded p-0.5 text-[9px] font-mono text-purple-400">
                                      <div className="w-full text-right pr-0.5">{(req.materialActualCost || 0).toLocaleString()}</div>
                                      <div className="w-full text-right pr-0.5 border-l border-purple-100/50">{(req.laborActualCost || 0).toLocaleString()}</div>
                                      <div className="w-full text-right border-l border-purple-100/50">{(req.expenseActualCost || 0).toLocaleString()}</div>
                                    </div>
                                  </td>
                                  <td className="px-2 py-1.5 text-right font-mono font-bold text-purple-600">{(req.totalSpendingActual || 0).toLocaleString()}</td>
                                  <td colSpan={2}></td>
                                </tr>
                              ))}
                            </Fragment>
                          );
                        })}
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky bottom-0 z-20 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.1)]">
        <div className="flex gap-8">
          <div className="flex flex-col"><span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">ESTIMATE TOTAL</span><span className="text-sm font-mono font-black text-zinc-900 dark:text-zinc-100">{totalEstimate.toLocaleString()} 원</span></div>
          <div className="flex flex-col"><span className="text-[9px] text-blue-500 uppercase font-black tracking-widest">ACTUAL SPENDING</span><span className="text-sm font-mono font-black text-blue-600 dark:text-blue-400">{totalActual.toLocaleString()} 원</span></div>
        </div>
        <div className={`text-xs font-black px-4 py-2 rounded-xl border-2 ${totalActual > totalEstimate ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
          MARGIN: {(totalEstimate - totalActual).toLocaleString()} 원
          <span className="ml-2 opacity-70">({totalEstimate > 0 ? ((totalEstimate - totalActual) / totalEstimate * 100).toFixed(1) : 0}%)</span>
        </div>
      </div>
    </div>
  );
}
