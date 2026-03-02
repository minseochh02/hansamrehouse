"use client";

import { useState } from "react";
import Link from "next/link";
import type { SpendingRequestItem } from "@/types/estimate";

// ... mock data ...
const MOCK_ADMIN_REQUESTS: (SpendingRequestItem & { projectName: string; customerName: string })[] = [
  {
    id: "1",
    projectName: "한남 더힐 302호",
    customerName: "홍길동",
    processName: "철거",
    subProcessName: "주방 철거",
    vendorName: "현대철거",
    itemName: "주방 가구 철거 및 폐기물",
    status: "최초",
    materialActualCost: 0,
    laborActualCost: 800000,
    expenseActualCost: 50000,
    totalSpendingActual: 850000,
    isUrgentToday: true,
    bankName: "국민은행",
    accountHolder: "이철거",
    accountNumber: "123-45-67890",
    amountBeforeTax: 850000,
    hasTaxDeduction: true,
    taxDeductionAmount: 28050,
    finalDepositAmount: 821950,
    paymentStatus: "대기",
    evidenceType: "세금계산서",
    evidencePhotoUrl: "https://example.com/invoice1.jpg",
    workStatusSheetUrl: "https://example.com/sheet1.pdf",
    date: "2024-03-02",
    createdAt: "2024-03-02",
    updatedAt: "2024-03-02",
    // ... remaining fields
  } as any,
  {
    id: "2",
    projectName: "반포 자이 104동",
    customerName: "김철수",
    processName: "타일",
    subProcessName: "욕실 타일",
    vendorName: "대성타일",
    itemName: "욕실 바닥 및 벽 타일 자재",
    status: "최초",
    materialActualCost: 1200000,
    laborActualCost: 0,
    expenseActualCost: 0,
    totalSpendingActual: 1200000,
    isUrgentToday: false,
    bankName: "신한은행",
    accountHolder: "(주)대성타일",
    accountNumber: "987-65-43210",
    amountBeforeTax: 1200000,
    hasTaxDeduction: false,
    taxDeductionAmount: 0,
    finalDepositAmount: 1200000,
    paymentStatus: "대기",
    evidenceType: "영수증",
    evidencePhotoUrl: "https://example.com/receipt2.jpg",
    workStatusSheetUrl: "",
    date: "2024-03-02",
    createdAt: "2024-03-02",
    updatedAt: "2024-03-02",
  } as any,
  {
    id: "3",
    projectName: "한남 더힐 302호",
    customerName: "홍길동",
    processName: "목공",
    subProcessName: "주방 가구",
    vendorName: "한샘키친",
    itemName: "주방 상하부장 선부금",
    status: "최초",
    materialActualCost: 3000000,
    laborActualCost: 0,
    expenseActualCost: 0,
    totalSpendingActual: 3000000,
    isUrgentToday: false,
    bankName: "우리은행",
    accountHolder: "한샘리하우스",
    accountNumber: "1002-345-678901",
    amountBeforeTax: 3000000,
    hasTaxDeduction: false,
    taxDeductionAmount: 0,
    finalDepositAmount: 3000000,
    paymentStatus: "완료",
    evidenceType: "계약서",
    evidencePhotoUrl: "",
    workStatusSheetUrl: "https://example.com/contract3.pdf",
    date: "2024-03-01",
    createdAt: "2024-03-01",
    updatedAt: "2024-03-01",
  } as any,
];

export default function SpendingAdminPage() {
  const [requests, setRequests] = useState(MOCK_ADMIN_REQUESTS);
  const [filterStatus, setFilterStatus] = useState<"전체" | "대기" | "완료" | "반려">("전체");
  const [hoveredContent, setHoveredContent] = useState<{ text: string; x: number; y: number } | null>(null);

  const urgentRequests = requests.filter(r => r.isUrgentToday && r.paymentStatus === "대기");
  const regularRequests = requests.filter(r => 
    filterStatus === "전체" ? true : r.paymentStatus === filterStatus
  );

  const pendingAmount = requests
    .filter(r => r.paymentStatus === "대기")
    .reduce((sum, r) => sum + r.finalDepositAmount, 0);

  const handleStatusChange = (id: string, newStatus: "대기" | "완료" | "반려") => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, paymentStatus: newStatus } : r));
  };

  const RequestTable = ({ items, title, emptyMessage, onHover, onMouseLeave }: { 
    items: typeof requests, 
    title?: string, 
    emptyMessage?: string,
    onHover: (text: string, x: number, y: number) => void,
    onMouseLeave: () => void
  }) => (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center gap-2 px-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs px-2 py-0.5 rounded-full font-bold">
            {items.length}
          </span>
        </div>
      )}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800 text-left">
                <th className="px-6 py-4 font-semibold text-zinc-500">현장 / 협력업체</th>
                <th className="px-6 py-4 font-semibold text-zinc-500">품목 상세</th>
                <th className="px-6 py-4 font-semibold text-zinc-500">입금 계좌 정보</th>
                <th className="px-6 py-4 font-semibold text-zinc-500">증빙 자료</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 text-right">최종 입금액</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 text-center">결제 상태</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500 italic">
                    {emptyMessage || "내역이 없습니다."}
                  </td>
                </tr>
              ) : (
                items.map((request) => (
                  <tr key={request.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {request.isUrgentToday && (
                          <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" title="당일 긴급" />
                        )}
                        <div>
                          <div 
                            className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px] cursor-help"
                            onMouseEnter={(e) => request.projectName && onHover(request.projectName, e.clientX, e.clientY)}
                            onMouseMove={(e) => request.projectName && onHover(request.projectName, e.clientX, e.clientY)}
                            onMouseLeave={onMouseLeave}
                          >
                            {request.projectName}
                          </div>
                          <div 
                            className="text-xs text-zinc-500 mt-0.5 truncate max-w-[150px] cursor-help"
                            onMouseEnter={(e) => request.vendorName && onHover(request.vendorName, e.clientX, e.clientY)}
                            onMouseMove={(e) => request.vendorName && onHover(request.vendorName, e.clientX, e.clientY)}
                            onMouseLeave={onMouseLeave}
                          >
                            {request.vendorName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-medium text-zinc-700 dark:text-zinc-300">{request.processName} - {request.subProcessName}</div>
                      <div 
                        className="text-xs text-zinc-400 mt-0.5 truncate max-w-[250px] cursor-help"
                        onMouseEnter={(e) => onHover(request.itemName, e.clientX, e.clientY)}
                        onMouseMove={(e) => onHover(request.itemName, e.clientX, e.clientY)}
                        onMouseLeave={onMouseLeave}
                      >
                        {request.itemName}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-mono text-zinc-900 dark:text-zinc-100">{request.bankName} {request.accountNumber}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">예금주: {request.accountHolder}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded w-fit">
                          {request.evidenceType || "미지정"}
                        </span>
                        <div className="flex items-center gap-2">
                          {request.evidencePhotoUrl ? (
                            <a 
                              href={request.evidencePhotoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                              title="증빙 사진 보기"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </a>
                          ) : (
                            <div className="p-1.5 rounded-md bg-zinc-50 text-zinc-300" title="사진 없음">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {request.workStatusSheetUrl ? (
                            <a 
                              href={request.workStatusSheetUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="작업현황표 보기"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </a>
                          ) : (
                            <div className="p-1.5 rounded-md bg-zinc-50 text-zinc-300" title="현황표 없음">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
                        {request.finalDepositAmount.toLocaleString()} 원
                      </div>
                      {request.hasTaxDeduction && (
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          3.3% 공제 (-{request.taxDeductionAmount.toLocaleString()}원)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        request.paymentStatus === '대기' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        request.paymentStatus === '완료' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {request.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {request.paymentStatus === "대기" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(request.id, "완료")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              결제 완료
                            </button>
                            <button
                              onClick={() => handleStatusChange(request.id, "반려")}
                              className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                              반려
                            </button>
                          </>
                        )}
                        {request.paymentStatus !== "대기" && (
                          <button
                            onClick={() => handleStatusChange(request.id, "대기")}
                            className="text-xs text-zinc-400 hover:text-zinc-600 underline"
                          >
                            상태 초기화
                          </button>
                        )}
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
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 text-zinc-900 dark:text-zinc-100 relative">
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

      <div className="max-w-7xl mx-auto space-y-10">
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">지출 결제 관리</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">현장의 지출 요청을 확인하고 송금을 진행합니다.</p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex items-center gap-8">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">결제 대기 총액</p>
              <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {pendingAmount.toLocaleString()} <span className="text-sm">원</span>
              </p>
            </div>
            <div className="h-10 w-px bg-zinc-100 dark:bg-zinc-800" />
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">대기 건수</p>
              <p className="text-2xl font-mono font-bold">
                {requests.filter(r => r.paymentStatus === "대기").length} <span className="text-sm">건</span>
              </p>
            </div>
          </div>
        </div>

        {/* 1. Urgent Section (Always visible if there are urgent pending items) */}
        {urgentRequests.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-red-500 rounded-full" />
              <h2 className="text-xl font-bold text-red-600">당일 긴급 요청</h2>
              <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold border border-red-100">
                {urgentRequests.length}
              </span>
            </div>
            <RequestTable 
              items={urgentRequests} 
              emptyMessage="긴급 요청 내역이 없습니다."
              onHover={(text, x, y) => setHoveredContent({ text, x, y })}
              onMouseLeave={() => setHoveredContent(null)}
            />
          </section>
        )}

        {/* 2. Regular Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
              <h2 className="text-xl font-bold">일반 요청 관리</h2>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              {(["전체", "대기", "완료", "반려"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterStatus === status
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md"
                      : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
                  }`}
                >
                  {status} {status !== "전체" && `(${requests.filter(r => r.paymentStatus === status).length})`}
                </button>
              ))}
            </div>
          </div>

          <RequestTable 
            items={regularRequests} 
            emptyMessage="요청 내역이 없습니다."
            onHover={(text, x, y) => setHoveredContent({ text, x, y })}
            onMouseLeave={() => setHoveredContent(null)}
          />
        </section>
      </div>
    </div>
  );
}
