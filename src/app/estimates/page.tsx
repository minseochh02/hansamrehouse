"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { STATUS_STYLES } from "@/components/estimate/constants";
import { StatusBadge } from "@/components/estimate/StatusBadge";
import type { Estimate, EstimateStatus } from "@/types/estimate";

// Mock data for multiple estimates
const MOCK_ESTIMATES: Partial<Estimate>[] = [
  {
    estimateCode: "EST-2024-001",
    customerName: "홍길동",
    shortAddress: "한남 더힐 302호",
    estimateDate: "2024-03-01",
    constructionStartDate: "2024-04-01",
    constructionEndDate: "2024-06-30",
    estimateStatus: "견적중",
    totalAmount: 45000000,
    manager: "김한샘",
  },
  {
    estimateCode: "EST-2024-002",
    customerName: "이몽룡",
    shortAddress: "반포 자이 104동 502호",
    estimateDate: "2024-02-15",
    constructionStartDate: "2024-03-15",
    constructionEndDate: "2024-05-15",
    estimateStatus: "계약완료",
    totalAmount: 32000000,
    manager: "이한샘",
  },
  {
    estimateCode: "EST-2024-003",
    customerName: "성춘향",
    shortAddress: "청담 자이 101동 1203호",
    estimateDate: "2024-01-20",
    constructionStartDate: "2024-02-10",
    constructionEndDate: "2024-04-10",
    estimateStatus: "공사완료",
    totalAmount: 58000000,
    manager: "박한샘",
  },
];

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch("/api/estimates");
      if (response.ok) {
        const data = await response.json();
        setEstimates(data);
      }
    } catch (error) {
      console.error("Failed to fetch estimates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("정말로 이 견적을 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.")) {
      return;
    }

    try {
      const response = await apiFetch(`/api/estimates/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("성공적으로 삭제되었습니다.");
        setEstimates((prev) => prev.filter((est) => est.id !== id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "삭제 실패");
      }
    } catch (error: any) {
      console.error("Failed to delete estimate:", error);
      alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const filteredEstimates = estimates.filter(
    (est) =>
      est.customerName?.includes(searchTerm) ||
      est.shortAddress?.includes(searchTerm) ||
      est.estimateCode?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              title="홈으로 돌아가기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                견적 내역
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                전체 견적 목록을 확인하고 관리합니다.
              </p>
            </div>
          </div>
          <Link
            href="/customer-info"
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            새 견적서 작성
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="고객명, 현장명, 견적코드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Estimate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEstimates.map((est) => (
            <Link
              key={est.estimateCode}
              href={`/estimate?id=${est.id}`}
              className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <StatusBadge status={est.status as EstimateStatus} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">
                      {est.estimateCode}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, est.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
                      title="견적 삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {est.customerName}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {est.shortAddress}
                  </p>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-y-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">견적일</div>
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 text-right">
                    {est.estimateDate}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">공사기간</div>
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 text-right">
                    {est.constructionStartDate} ~ {est.constructionEndDate}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">담당자</div>
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 text-right">
                    {est.manager}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">총 견적금액</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {est.totalAmount?.toLocaleString()}원
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredEstimates.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
            <p className="text-zinc-500 dark:text-zinc-400">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
