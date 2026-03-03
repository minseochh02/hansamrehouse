"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface StandardItem {
  id: string;
  processName: string;
  subProcessName: string;
  itemName: string;
  unit?: string;
}

export default function StandardItemsPage() {
  const [items, setItems] = useState<StandardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState<Omit<StandardItem, "id">>({
    processName: "",
    subProcessName: "",
    itemName: "",
    unit: "식",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch("/api/items");
      if (response.ok) {
        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [isManualProcess, setIsManualProcess] = useState(false);
  const [isManualSubProcess, setIsManualSubProcess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [unitSuggestions, setUnitSuggestions] = useState<string[]>([]);

  const safeItems = Array.isArray(items) ? items : [];

  const filteredItems = safeItems.filter(item => {
    const categoryMatch = !filterCategory || item.processName === filterCategory;
    const subCategoryMatch = !filterSubCategory || item.subProcessName === filterSubCategory;
    return categoryMatch && subCategoryMatch;
  });

  const uniqueFilterSubCategories = Array.from(
    new Set(
      safeItems
        .filter(item => !filterCategory || item.processName === filterCategory)
        .map(item => item.subProcessName)
    )
  ).sort();

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchUnitSuggestions();
  }, []);

  const fetchUnitSuggestions = async () => {
    try {
      const response = await apiFetch("/api/units");
      if (response.ok) {
        const data = await response.json();
        setUnitSuggestions(data);
      }
    } catch (error) {
      console.error("Failed to fetch units:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiFetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await apiFetch(`/api/subcategories?categoryId=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setSubCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
    }
  };

  useEffect(() => {
    if (newItem.processName) {
      fetchSubCategories(newItem.processName);
    } else {
      setSubCategories([]);
    }
  }, [newItem.processName]);

  const handleDropCategory = async (name: string) => {
    if (!confirm(`'${name}' 공정과 그 안의 모든 세부공정, 품목이 삭제됩니다. 계속하시겠습니까?`)) return;
    try {
      const response = await apiFetch(`/api/categories?name=${encodeURIComponent(name)}`, { method: "DELETE" });
      if (response.ok) {
        await fetchCategories();
        await fetchItems();
        if (newItem.processName === name) {
          setNewItem({ ...newItem, processName: "", subProcessName: "" });
        }
      }
    } catch (error) {
      console.error("Failed to drop category:", error);
    }
  };

  const handleDropSubCategory = async (name: string, categoryId: string) => {
    if (!confirm(`'${name}' 세부공정과 그 안의 모든 품목이 삭제됩니다. 계속하시겠습니까?`)) return;
    try {
      const response = await apiFetch(`/api/subcategories?name=${encodeURIComponent(name)}&categoryId=${encodeURIComponent(categoryId)}`, { method: "DELETE" });
      if (response.ok) {
        await fetchSubCategories(categoryId);
        await fetchItems();
        if (newItem.subProcessName === name) {
          setNewItem({ ...newItem, subProcessName: "" });
        }
      }
    } catch (error) {
      console.error("Failed to drop subcategory:", error);
    }
  };

  const handleAddItem = async () => {
    if (newItem.processName && newItem.subProcessName && newItem.itemName) {
      try {
        const method = editingId ? "PATCH" : "POST";
        const body = editingId ? { ...newItem, id: editingId } : newItem;

        const response = await apiFetch("/api/items", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          await fetchItems();
          await fetchCategories();
          await fetchUnitSuggestions();
          await fetchSubCategories(newItem.processName);
          setNewItem({ 
            processName: newItem.processName, 
            subProcessName: "", 
            itemName: "",
            unit: "식"
          });
          setEditingId(null);
          setIsManualProcess(false);
          setIsManualSubProcess(false);
        }
      } catch (error) {
        console.error("Failed to save item:", error);
      }
    }
  };

  const handleEditItem = (item: StandardItem) => {
    setNewItem({
      processName: item.processName,
      subProcessName: item.subProcessName,
      itemName: item.itemName,
      unit: item.unit || "식",
    });
    setEditingId(item.id);
    setIsManualProcess(false);
    setIsManualSubProcess(false);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    
    try {
      const response = await apiFetch(`/api/items?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchItems();
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-sm font-medium group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          메인 화면으로 돌아가기
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">표준 품목 관리</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            현장에서 공통적으로 사용하는 공정, 세부공정, 품목명을 관리합니다.
          </p>
        </div>

        {/* Add New Item Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
              {editingId ? "품목 수정" : "새 품목 추가"}
            </h2>
            {editingId && (
              <button 
                onClick={() => {
                  setEditingId(null);
                  setNewItem({ processName: "", subProcessName: "", itemName: "" });
                  setIsManualProcess(false);
                  setIsManualSubProcess(false);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-900 font-medium"
              >
                수정 취소
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Process Select/Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-zinc-500">공정</label>
                <div className="flex gap-2">
                  {!isManualProcess && newItem.processName && (
                    <button 
                      onClick={() => handleDropCategory(newItem.processName)}
                      className="text-[10px] text-red-500 hover:underline font-bold"
                    >
                      공정 삭제
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsManualProcess(!isManualProcess);
                      setNewItem({ ...newItem, processName: "" });
                    }}
                    className="text-[10px] text-amber-600 hover:underline font-bold flex items-center gap-0.5"
                  >
                    {isManualProcess ? "목록에서 선택" : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                        </svg>
                        직접 추가
                      </>
                    )}
                  </button>
                </div>
              </div>
              {isManualProcess ? (
                <input
                  type="text"
                  placeholder="새 공정명 입력..."
                  value={newItem.processName}
                  onChange={(e) => setNewItem({ ...newItem, processName: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  autoFocus
                />
              ) : (
                <select
                  value={newItem.processName}
                  onChange={(e) => setNewItem({ ...newItem, processName: e.target.value, subProcessName: "" })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">공정 선택...</option>
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* SubProcess Select/Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-zinc-500">세부공정</label>
                <div className="flex gap-2">
                  {!isManualSubProcess && newItem.subProcessName && (
                    <button 
                      onClick={() => handleDropSubCategory(newItem.subProcessName, newItem.processName)}
                      className="text-[10px] text-red-500 hover:underline font-bold"
                    >
                      세부공정 삭제
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsManualSubProcess(!isManualSubProcess);
                      setNewItem({ ...newItem, subProcessName: "" });
                    }}
                    className="text-[10px] text-amber-600 hover:underline font-bold flex items-center gap-0.5"
                  >
                    {isManualSubProcess ? "목록에서 선택" : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                        </svg>
                        직접 추가
                      </>
                    )}
                  </button>
                </div>
              </div>
              {isManualSubProcess ? (
                <input
                  type="text"
                  placeholder="새 세부공정명 입력..."
                  value={newItem.subProcessName}
                  onChange={(e) => setNewItem({ ...newItem, subProcessName: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  autoFocus
                />
              ) : (
                <select
                  value={newItem.subProcessName}
                  disabled={!newItem.processName}
                  onChange={(e) => setNewItem({ ...newItem, subProcessName: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">세부공정 선택...</option>
                  {subCategories.map(sc => (
                    <option key={sc.name} value={sc.name}>{sc.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Item Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">품목명</label>
              <input
                type="text"
                placeholder="품목명 입력..."
                value={newItem.itemName}
                onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>

            {/* Unit Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">단위</label>
              <input
                type="text"
                placeholder="단위 (예: 식, ㎡, m...)"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                list="unit-suggestions"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
              <datalist id="unit-suggestions">
                {unitSuggestions.map(unit => (
                  <option key={unit} value={unit} />
                ))}
              </datalist>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={handleAddItem}
                disabled={!newItem.processName || !newItem.subProcessName || !newItem.itemName}
                className="px-8 py-3 bg-zinc-900 dark:bg-amber-600 hover:bg-black dark:hover:bg-amber-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-zinc-900/10 dark:shadow-amber-600/20 flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                {editingId ? "수정 내용 저장하기" : "새 품목 등록하기"}
              </button>
          </div>
        </div>

        {/* Item List Table */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex-1 space-y-1.5 w-full">
              <label className="text-xs font-bold text-zinc-500 ml-1">공정 필터</label>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setFilterSubCategory("");
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">전체 공정</option>
                {categories.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-1.5 w-full">
              <label className="text-xs font-bold text-zinc-500 ml-1">세부공정 필터</label>
              <select
                value={filterSubCategory}
                onChange={(e) => setFilterSubCategory(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">전체 세부공정</option>
                {uniqueFilterSubCategories.map(sc => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setFilterCategory("");
                setFilterSubCategory("");
              }}
              className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              필터 초기화
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800 text-left">
                    <th className="px-6 py-4 font-semibold text-zinc-500">공정</th>
                    <th className="px-6 py-4 font-semibold text-zinc-500">세부공정</th>
                    <th className="px-6 py-4 font-semibold text-zinc-500">품목명</th>
                    <th className="px-6 py-4 font-semibold text-zinc-500 text-center">단위</th>
                    <th className="px-6 py-4 font-semibold text-zinc-500 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500 italic">
                        데이터를 불러오는 중...
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500 italic">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                          {item.processName}
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                          {item.subProcessName}
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                          {item.itemName}
                        </td>
                        <td className="px-6 py-4 text-center text-zinc-500">
                          {item.unit || "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                              title="수정"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
