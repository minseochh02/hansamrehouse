"use client";

import { useState } from "react";
import Link from "next/link";

interface StandardItem {
  id: string;
  processName: string;
  subProcessName: string;
  itemName: string;
}

const MOCK_STANDARD_ITEMS: StandardItem[] = [
  { id: "1", processName: "철거", subProcessName: "주방 철거", itemName: "주방 가구 철거 및 폐기물" },
  { id: "2", processName: "타일", subProcessName: "욕실 타일", itemName: "욕실 바닥 및 벽 타일 자재" },
  { id: "3", processName: "목공", subProcessName: "주방 가구", itemName: "주방 상하부장 선부금" },
  { id: "4", processName: "전기", subProcessName: "조명 공사", itemName: "거실 매립등 및 배선 공사" },
  { id: "5", processName: "도장", subProcessName: "벽면 도장", itemName: "친환경 페인트 도장" },
];

export default function StandardItemsPage() {
  const [items, setItems] = useState<StandardItem[]>(MOCK_STANDARD_ITEMS);
  const [newItem, setNewItem] = useState<Omit<StandardItem, "id">>({
    processName: "",
    subProcessName: "",
    itemName: "",
  });

  const [isManualProcess, setIsManualProcess] = useState(false);
  const [isManualSubProcess, setIsManualSubProcess] = useState(false);

  const uniqueProcesses = Array.from(new Set(items.map(item => item.processName))).sort();
  const uniqueSubProcesses = Array.from(
    new Set(
      items
        .filter(item => item.processName === newItem.processName)
        .map(item => item.subProcessName)
    )
  ).sort();

  const handleAddItem = () => {
    if (newItem.processName && newItem.subProcessName && newItem.itemName) {
      const id = (items.length + 1).toString();
      setItems([...items, { ...newItem, id }]);
      setNewItem({ 
        processName: isManualProcess ? newItem.processName : newItem.processName, 
        subProcessName: "", 
        itemName: "" 
      });
      // Keep processName if adding multiple items for same process
      // but reset subProcess and item
      setIsManualSubProcess(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
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
              새 품목 추가
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Process Select/Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-zinc-500">공정</label>
                <button 
                  onClick={() => {
                    setIsManualProcess(!isManualProcess);
                    setNewItem({ ...newItem, processName: "" });
                  }}
                  className="text-[10px] text-amber-600 hover:underline font-bold"
                >
                  {isManualProcess ? "목록에서 선택" : "직접 입력"}
                </button>
              </div>
              {isManualProcess ? (
                <input
                  type="text"
                  placeholder="공정명 입력..."
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
                  {uniqueProcesses.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              )}
            </div>

            {/* SubProcess Select/Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-zinc-500">세부공정</label>
                <button 
                  onClick={() => {
                    setIsManualSubProcess(!isManualSubProcess);
                    setNewItem({ ...newItem, subProcessName: "" });
                  }}
                  className="text-[10px] text-amber-600 hover:underline font-bold"
                >
                  {isManualSubProcess ? "목록에서 선택" : "직접 입력"}
                </button>
              </div>
              {isManualSubProcess ? (
                <input
                  type="text"
                  placeholder="세부공정명 입력..."
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
                  {uniqueSubProcesses.map(sp => (
                    <option key={sp} value={sp}>{sp}</option>
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
              새 품목 등록하기
            </button>
          </div>
        </div>

        {/* Item List Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800 text-left">
                  <th className="px-6 py-4 font-semibold text-zinc-500">공정</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500">세부공정</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500">품목명</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500 italic">
                      등록된 품목이 없습니다.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
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
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
  );
}
