"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Vendor {
  id: string;
  name: string;
  businessNumber?: string;
  representative?: string;
  phone?: string;
  address?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newVendor, setNewVendor] = useState<Omit<Vendor, "id"> & { id?: string }>({
    id: "",
    name: "",
    businessNumber: "",
    representative: "",
    phone: "",
    address: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch("/api/vendors");
      if (response.ok) {
        const data = await response.json();
        setVendors(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVendor = async () => {
    if (!newVendor.name) return;

    try {
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { ...newVendor, id: editingId } : newVendor;

      const response = await apiFetch("/api/vendors", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchVendors();
        setNewVendor({
          id: "",
          name: "",
          businessNumber: "",
          representative: "",
          phone: "",
          address: "",
          bankName: "",
          accountNumber: "",
          accountHolder: "",
        });
        setEditingId(null);
      }
    } catch (error) {
      console.error("Failed to save vendor:", error);
    }
  };

  const handleEditVendor = (vendor: Vendor) => {
    setNewVendor({
      id: vendor.id,
      name: vendor.name,
      businessNumber: vendor.businessNumber || "",
      representative: vendor.representative || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
      bankName: vendor.bankName || "",
      accountNumber: vendor.accountNumber || "",
      accountHolder: vendor.accountHolder || "",
    });
    setEditingId(vendor.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteVendor = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    
    try {
      const response = await apiFetch(`/api/vendors?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchVendors();
      }
    } catch (error) {
      console.error("Failed to delete vendor:", error);
    }
  };

  const filteredVendors = vendors.filter(v => {
    const searchMatch = !searchTerm || 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.phone && v.phone.includes(searchTerm)) ||
      (v.businessNumber && v.businessNumber.includes(searchTerm)) ||
      (v.representative && v.representative.toLowerCase().includes(searchTerm.toLowerCase()));
    return searchMatch;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-sm font-medium group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          메인 화면으로 돌아가기
        </Link>

        <div>
          <h1 className="text-3xl font-bold">협력업체 관리</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            현장에 물품이나 용역을 공급하는 협력업체의 정보를 관리합니다.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-5 bg-emerald-500 rounded-full" />
              {editingId ? "협력업체 정보 수정" : "새 협력업체 등록"}
            </h2>
            {editingId && (
              <button 
                onClick={() => {
                  setEditingId(null);
                  setNewVendor({
                    id: "",
                    name: "",
                    businessNumber: "",
                    representative: "",
                    phone: "",
                    address: "",
                    bankName: "",
                    accountNumber: "",
                    accountHolder: "",
                  });
                }}
                className="text-xs text-zinc-500 hover:text-zinc-900 font-medium"
              >
                수정 취소
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">업체명</label>
              <input
                type="text"
                placeholder="업체명 입력..."
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">사업자번호</label>
              <input
                type="text"
                placeholder="000-00-00000"
                value={newVendor.businessNumber}
                onChange={(e) => setNewVendor({ ...newVendor, businessNumber: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">대표자명</label>
              <input
                type="text"
                placeholder="대표자 성명"
                value={newVendor.representative}
                onChange={(e) => setNewVendor({ ...newVendor, representative: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">연락처</label>
              <input
                type="text"
                placeholder="010-0000-0000"
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-zinc-500 ml-1">주소</label>
              <input
                type="text"
                placeholder="업체 주소 입력"
                value={newVendor.address}
                onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">은행명</label>
              <input
                type="text"
                placeholder="은행명"
                value={newVendor.bankName}
                onChange={(e) => setNewVendor({ ...newVendor, bankName: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">계좌번호</label>
              <input
                type="text"
                placeholder="계좌번호"
                value={newVendor.accountNumber}
                onChange={(e) => setNewVendor({ ...newVendor, accountNumber: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">예금주</label>
              <input
                type="text"
                placeholder="예금주"
                value={newVendor.accountHolder}
                onChange={(e) => setNewVendor({ ...newVendor, accountHolder: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={handleAddVendor}
                disabled={!newVendor.name}
                className="px-8 py-3 bg-zinc-900 dark:bg-emerald-600 hover:bg-black dark:hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-zinc-900/10 dark:shadow-emerald-600/20 flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                {editingId ? "수정 내용 저장하기" : "새 협력업체 등록하기"}
              </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="space-y-1.5 w-full">
            <label className="text-xs font-bold text-zinc-500 ml-1">검색</label>
            <input
              type="text"
              placeholder="업체명, 대표자, 연락처, 사업자번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800 text-left">
                  <th className="px-6 py-4 font-semibold text-zinc-500">업체명</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500">사업자번호 / 대표자</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500">연락처 / 주소</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500">계좌정보</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500 italic">
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500 italic">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {vendor.name}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        <div className="flex flex-col">
                          <span>{vendor.businessNumber || "-"}</span>
                          <span className="text-xs text-zinc-400">{vendor.representative}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        <div className="flex flex-col">
                          <span>{vendor.phone || "-"}</span>
                          <span className="text-xs text-zinc-400 truncate max-w-[200px]">{vendor.address}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {vendor.bankName ? (
                          <div className="flex flex-col text-xs">
                            <span>{vendor.bankName}</span>
                            <span className="text-zinc-400">{vendor.accountNumber}</span>
                            <span className="text-zinc-400">({vendor.accountHolder})</span>
                          </div>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditVendor(vendor)}
                            className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            title="수정"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteVendor(vendor.id)}
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
  );
}
