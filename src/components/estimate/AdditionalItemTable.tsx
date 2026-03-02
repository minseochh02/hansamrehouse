import { useState } from "react";
import type { AdditionalLineItem } from "@/types/estimate";

export function AdditionalItemTable({ 
  items,
  onItemChange,
  onAddItem,
  onDeleteItem
}: { 
  items: AdditionalLineItem[];
  onItemChange: (id: string, field: keyof AdditionalLineItem, value: any) => void;
  onAddItem: (newItem: Omit<AdditionalLineItem, "id" | "totalAmount">) => void;
  onDeleteItem: (id: string) => void;
}) {
  const [newItem, setNewItem] = useState<Omit<AdditionalLineItem, "id" | "totalAmount">>({
    requestDate: new Date().toISOString().split('T')[0],
    location: "",
    name: "",
    materialCost: 0,
    laborCost: 0,
    expense: 0,
    additionalAmount: 0,
    originalAmount: 0,
  });

  const handleAddNewItem = () => {
    if (newItem.name || newItem.location) {
      onAddItem(newItem);
      setNewItem({
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

  const calculateAdditionalAmount = (item: any) => {
    return Number(item.materialCost || 0) + Number(item.laborCost || 0) + Number(item.expense || 0);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-50/50 dark:bg-zinc-800/20">
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-32">요청일</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-32">공간명</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">품목</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right w-24">재료비</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right w-24">노무비</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right w-24">경비</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right w-28">추가금액</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right w-28">기존금액</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right w-28">합계금액</th>
            <th className="px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-12"></th>
          </tr>
        </thead>
        <tbody>
          {/* New Additional Item Input Row */}
          <tr className="border-b-2 border-purple-100 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-900/10">
            <td className="px-2 py-2">
              <input
                type="date"
                value={newItem.requestDate}
                onChange={(e) => setNewItem({ ...newItem, requestDate: e.target.value })}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </td>
            <td className="px-2 py-2">
              <input
                type="text"
                placeholder="공간명..."
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </td>
            <td className="px-2 py-2">
              <input
                type="text"
                placeholder="품목 입력..."
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </td>
            <td className="px-2 py-2">
              <input
                type="number"
                placeholder="0"
                value={newItem.materialCost || ""}
                onChange={(e) => {
                  const materialCost = Number(e.target.value);
                  const updatedNewItem = { ...newItem, materialCost };
                  setNewItem({ ...updatedNewItem, additionalAmount: calculateAdditionalAmount(updatedNewItem) });
                }}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-sm text-right font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </td>
            <td className="px-2 py-2">
              <input
                type="number"
                placeholder="0"
                value={newItem.laborCost || ""}
                onChange={(e) => {
                  const laborCost = Number(e.target.value);
                  const updatedNewItem = { ...newItem, laborCost };
                  setNewItem({ ...updatedNewItem, additionalAmount: calculateAdditionalAmount(updatedNewItem) });
                }}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-sm text-right font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </td>
            <td className="px-2 py-2">
              <input
                type="number"
                placeholder="0"
                value={newItem.expense || ""}
                onChange={(e) => {
                  const expense = Number(e.target.value);
                  const updatedNewItem = { ...newItem, expense };
                  setNewItem({ ...updatedNewItem, additionalAmount: calculateAdditionalAmount(updatedNewItem) });
                }}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-sm text-right font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </td>
            <td className="px-2 py-2 text-right font-mono font-medium text-purple-600 dark:text-purple-400">
              {newItem.additionalAmount.toLocaleString()}
            </td>
            <td className="px-2 py-2">
              <input
                type="number"
                placeholder="0"
                value={newItem.originalAmount || ""}
                onChange={(e) => setNewItem({ ...newItem, originalAmount: Number(e.target.value) })}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-sm text-right font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </td>
            <td className="px-2 py-2 text-right font-mono font-medium text-purple-600 dark:text-purple-400">
              {(newItem.additionalAmount + newItem.originalAmount).toLocaleString()}
            </td>
            <td className="px-2 py-2 text-center">
              <button
                onClick={handleAddNewItem}
                className="p-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </td>
          </tr>

          {items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <td className="px-2 py-1.5">
                <input
                  type="date"
                  value={item.requestDate}
                  onChange={(e) => onItemChange(item.id, "requestDate", e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </td>
              <td className="px-2 py-1.5">
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) => onItemChange(item.id, "location", e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </td>
              <td className="px-2 py-1.5">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onItemChange(item.id, "name", e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </td>
              <td className="px-2 py-1.5 text-right font-mono">
                <input
                  type="number"
                  value={item.materialCost}
                  onChange={(e) => onItemChange(item.id, "materialCost", Number(e.target.value))}
                  className="w-full bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 text-right text-zinc-900 dark:text-zinc-100"
                />
              </td>
              <td className="px-2 py-1.5 text-right font-mono">
                <input
                  type="number"
                  value={item.laborCost}
                  onChange={(e) => onItemChange(item.id, "laborCost", Number(e.target.value))}
                  className="w-full bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 text-right text-zinc-900 dark:text-zinc-100"
                />
              </td>
              <td className="px-2 py-1.5 text-right font-mono">
                <input
                  type="number"
                  value={item.expense}
                  onChange={(e) => onItemChange(item.id, "expense", Number(e.target.value))}
                  className="w-full bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 text-right text-zinc-900 dark:text-zinc-100"
                />
              </td>
              <td className="px-2 py-1.5 text-right font-mono text-zinc-900 dark:text-zinc-100">
                {item.additionalAmount.toLocaleString()}
              </td>
              <td className="px-2 py-1.5 text-right font-mono text-zinc-500 dark:text-zinc-400">
                <input
                  type="number"
                  value={item.originalAmount}
                  onChange={(e) => onItemChange(item.id, "originalAmount", Number(e.target.value))}
                  className="w-full bg-transparent border-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 text-right"
                />
              </td>
              <td className="px-2 py-1.5 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100">
                {item.totalAmount.toLocaleString()}
              </td>
              <td className="px-2 py-1.5 text-center">
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-md text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-zinc-300 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/30">
            <td colSpan={3} className="px-2 py-2 text-right font-semibold text-zinc-900 dark:text-zinc-100">
              추가 합계
            </td>
            <td className="px-2 py-2 text-right font-bold text-zinc-600 dark:text-zinc-400 font-mono">
              {items.reduce((sum, item) => sum + (item.materialCost || 0), 0).toLocaleString()}
            </td>
            <td className="px-2 py-2 text-right font-bold text-zinc-600 dark:text-zinc-400 font-mono">
              {items.reduce((sum, item) => sum + (item.laborCost || 0), 0).toLocaleString()}
            </td>
            <td className="px-2 py-2 text-right font-bold text-zinc-600 dark:text-zinc-400 font-mono">
              {items.reduce((sum, item) => sum + (item.expense || 0), 0).toLocaleString()}
            </td>
            <td className="px-2 py-2 text-right font-bold text-purple-600 dark:text-purple-400 font-mono text-base">
              {items.reduce((sum, item) => sum + item.additionalAmount, 0).toLocaleString()}
            </td>
            <td className="px-2 py-2 text-right font-bold text-zinc-500 dark:text-zinc-400 font-mono text-base">
              {items.reduce((sum, item) => sum + item.originalAmount, 0).toLocaleString()}
            </td>
            <td className="px-2 py-2 text-right font-bold text-indigo-600 dark:text-indigo-400 font-mono text-base">
              {items.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString()}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
