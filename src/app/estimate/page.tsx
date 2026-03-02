"use client";

import { useState } from "react";
import type {
  Estimate,
  EstimateStatus,
  EstimateLineItem,
} from "@/types/estimate";

const STATUS_STYLES: Record<EstimateStatus, string> = {
  견적중: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  계약완료: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  공사중: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  추가공사: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  공사완료: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  정산완료: "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300",
};

const MOCK_ESTIMATE: Estimate = {
  estimateDate: "2024-03-01",
  constructionStartDate: "2024-04-01",
  constructionEndDate: "2024-06-30",
  additionalEstimateDate: "",
  additionalConstructionStartDate: "",
  additionalConstructionEndDate: "",
  manager: "김한샘",
  siteManager: "박현장",
  estimateCode: "EST-2024-001",
  estimateStatus: "견적중",
  siteCode: "SITE-HN-302",
  totalAmount: 45000000,
  contract: { date: "2024-03-15", percentage: 30, amount: 13500000 },
  commencement: { date: "2024-04-01", percentage: 30, amount: 13500000 },
  midterm: { date: "2024-05-15", percentage: 30, amount: 13500000 },
  moveInCleaningDate: "2024-06-28",
  balance: { date: "2024-06-30", percentage: 10, amount: 4500000 },
  lineItems: [
    { id: "1", category: "철거", name: "기존 주방 철거", spec: "일식", unit: "식", quantity: 1, unitPrice: 800000, amount: 800000, note: "" },
    { id: "2", category: "철거", name: "기존 욕실 철거", spec: "일식", unit: "식", quantity: 2, unitPrice: 600000, amount: 1200000, note: "욕실 2개" },
    { id: "3", category: "목공", name: "주방 상부장", spec: "자작합판 18T", unit: "M", quantity: 4.5, unitPrice: 350000, amount: 1575000, note: "" },
    { id: "4", category: "목공", name: "주방 하부장", spec: "자작합판 18T", unit: "M", quantity: 3.2, unitPrice: 400000, amount: 1280000, note: "" },
    { id: "5", category: "타일", name: "주방 벽 타일", spec: "300x600 포세린", unit: "㎡", quantity: 12, unitPrice: 85000, amount: 1020000, note: "" },
    { id: "6", category: "타일", name: "욕실 바닥 타일", spec: "300x300 논슬립", unit: "㎡", quantity: 8, unitPrice: 95000, amount: 760000, note: "" },
    { id: "7", category: "도장", name: "거실 벽면 도장", spec: "친환경 수성페인트", unit: "㎡", quantity: 85, unitPrice: 12000, amount: 1020000, note: "" },
    { id: "8", category: "설비", name: "주방 배관 교체", spec: "스텐파이프", unit: "식", quantity: 1, unitPrice: 1500000, amount: 1500000, note: "" },
    { id: "9", category: "전기", name: "조명 교체", spec: "LED 매입등", unit: "EA", quantity: 15, unitPrice: 45000, amount: 675000, note: "거실+주방" },
  ],
};

function formatCurrency(value: number) {
  return value.toLocaleString("ko-KR") + "원";
}

function StatusBadge({ status }: { status: EstimateStatus }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-sm text-zinc-900 dark:text-zinc-100">
        {value || <span className="text-zinc-300 dark:text-zinc-600 italic">미입력</span>}
      </dd>
    </div>
  );
}

function PaymentTimeline({ estimate }: { estimate: Estimate }) {
  const milestones = [
    { label: "계약금", ...estimate.contract },
    { label: "착수금", ...estimate.commencement },
    { label: "중도금", ...estimate.midterm },
    { label: "잔금", ...estimate.balance },
  ];

  return (
    <div className="space-y-0">
      {milestones.map((m, i) => (
        <div key={m.label} className="relative flex gap-4">
          {/* Vertical line */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-900/40 z-10 mt-1 shrink-0" />
            {i < milestones.length - 1 && (
              <div className="w-px flex-1 bg-indigo-200 dark:bg-indigo-800" />
            )}
          </div>
          {/* Content */}
          <div className="pb-6 flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{m.label}</span>
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{m.percentage}%</span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
              {m.date || "미정"} &middot; {formatCurrency(m.amount)}
            </p>
          </div>
        </div>
      ))}
      {/* Move-in cleaning */}
      <div className="relative flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-100 dark:ring-green-900/40 z-10 mt-1 shrink-0" />
        </div>
        <div className="pb-2 flex-1">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">입주청소</span>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            {estimate.moveInCleaningDate || "미정"}
          </p>
        </div>
      </div>
    </div>
  );
}

function LineItemTable({ items }: { items: EstimateLineItem[] }) {
  const categories = Array.from(new Set(items.map((item) => item.category)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left">
            <th className="px-3 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-10">No</th>
            <th className="px-3 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">공종</th>
            <th className="px-3 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">품명</th>
            <th className="px-3 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">규격</th>
            <th className="px-3 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center">단위</th>
            <th className="px-3 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">수량</th>
            <th className="px-3 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">단가</th>
            <th className="px-3 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">금액</th>
            <th className="px-3 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">비고</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const catItems = items.filter((item) => item.category === cat);
            const subtotal = catItems.reduce((sum, item) => sum + item.amount, 0);

            return catItems.map((item, idx) => (
              <tr
                key={item.id}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <td className="px-3 py-2.5 text-zinc-400 font-mono text-xs">{item.id}</td>
                {idx === 0 ? (
                  <td
                    rowSpan={catItems.length}
                    className="px-3 py-2.5 font-medium text-zinc-900 dark:text-zinc-100 align-top bg-zinc-50/50 dark:bg-zinc-800/30"
                  >
                    {cat}
                    <div className="text-xs text-zinc-400 mt-1 font-normal">
                      소계: {formatCurrency(subtotal)}
                    </div>
                  </td>
                ) : null}
                <td className="px-3 py-2.5 text-zinc-900 dark:text-zinc-100">{item.name}</td>
                <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400">{item.spec}</td>
                <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400 text-center">{item.unit}</td>
                <td className="px-3 py-2.5 text-zinc-900 dark:text-zinc-100 text-right font-mono">{item.quantity}</td>
                <td className="px-3 py-2.5 text-zinc-900 dark:text-zinc-100 text-right font-mono">{item.unitPrice.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-zinc-900 dark:text-zinc-100 text-right font-mono font-medium">{item.amount.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400">{item.note}</td>
              </tr>
            ));
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-zinc-300 dark:border-zinc-600">
            <td colSpan={7} className="px-3 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100">
              합계
            </td>
            <td className="px-3 py-3 text-right font-bold text-indigo-600 dark:text-indigo-400 font-mono text-base">
              {items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

type Tab = "overview" | "lineItems";

export default function EstimatePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const estimate = MOCK_ESTIMATE;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Top Summary Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {estimate.estimateCode}
              </h1>
              <StatusBadge status={estimate.estimateStatus} />
              <span className="text-xs font-mono text-zinc-400">
                {estimate.siteCode}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">총 견적금액</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                {formatCurrency(estimate.totalAmount)}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 -mb-px">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              견적 개요
            </button>
            <button
              onClick={() => setActiveTab("lineItems")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === "lineItems"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              내역서
              <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {estimate.lineItems.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schedule */}
            <SectionCard title="공사 일정">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="견적일" value={estimate.estimateDate} />
                <div />
                <Field label="공사 시작일" value={estimate.constructionStartDate} />
                <Field label="공사 종료일" value={estimate.constructionEndDate} />
              </dl>
            </SectionCard>

            {/* Additional Work Schedule */}
            <SectionCard title="추가공사 일정">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="추가 견적일" value={estimate.additionalEstimateDate} />
                <div />
                <Field label="추가공사 시작일" value={estimate.additionalConstructionStartDate} />
                <Field label="추가공사 종료일" value={estimate.additionalConstructionEndDate} />
              </dl>
            </SectionCard>

            {/* Personnel & Codes */}
            <SectionCard title="담당 정보">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="담당자" value={estimate.manager} />
                <Field label="현장소장" value={estimate.siteManager} />
                <Field label="견적코드" value={estimate.estimateCode} />
                <Field label="현장코드" value={estimate.siteCode} />
              </dl>
            </SectionCard>

            {/* Payment Milestones */}
            <SectionCard title="결제 일정">
              <PaymentTimeline estimate={estimate} />
            </SectionCard>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                내역서
              </h3>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {estimate.lineItems.length}개 항목
              </span>
            </div>
            <LineItemTable items={estimate.lineItems} />
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 text-center">
          <a
            href="/customer-info"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
          >
            &larr; 고객 정보 수정으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
