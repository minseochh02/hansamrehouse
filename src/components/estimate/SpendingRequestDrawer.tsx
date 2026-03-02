import { useState, useEffect } from "react";
import type { SpendingRequestItem, EstimateLineItem } from "@/types/estimate";
import { ChevronIcon } from "./ChevronIcon";

interface SpendingRequestDrawerProps {
  item: SpendingRequestItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: SpendingRequestItem | Omit<SpendingRequestItem, "id">) => void;
  allSpendingRequests: SpendingRequestItem[];
  lineItems?: EstimateLineItem[];
}

export function SpendingRequestDrawer({
  item,
  isOpen,
  onClose,
  onSave,
  allSpendingRequests,
  lineItems = [],
}: SpendingRequestDrawerProps) {
  const [formData, setFormData] = useState<Partial<SpendingRequestItem>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    costs: true,
    autoTotals: true,
    evidence: true,
    delivery: true,
    account: true,
    others: true,
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else if (isOpen) {
      const now = new Date().toISOString().split('T')[0];
      setFormData({
        lineItemId: "",
        processName: "",
        subProcessName: "",
        itemName: "",
        status: "최초",
        materialEstimateCost: 0,
        materialActualCost: 0,
        laborEstimateCost: 0,
        laborActualCost: 0,
        expenseEstimateCost: 0,
        expenseActualCost: 0,
        evidenceType: "",
        evidencePhotoUrl: "",
        workStatusSheetUrl: "",
        evidenceGuide: "",
        isUrgentToday: false,
        deadlineMemo: "",
        purchaseLink: "",
        deliveryType: "",
        vendorName: "",
        isExistingVendorAccount: false,
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        amountBeforeTax: 0,
        hasTaxDeduction: false,
        taxDeductionAmount: 0,
        finalDepositAmount: 0,
        memo: "",
        date: now,
        contactInfo: "",
        paymentStatus: "대기",
        createdAt: now,
        updatedAt: now,
      });
    }
  }, [item?.id, item?.updatedAt, isOpen]);

  // Derived calculations (calculated during render to avoid useEffect loops while typing)
  const materialEstimate = Number(formData.materialEstimateCost || 0);
  const laborEstimate = Number(formData.laborEstimateCost || 0);
  const expenseEstimate = Number(formData.expenseEstimateCost || 0);
  
  const materialActual = Number(formData.materialActualCost || 0);
  const laborActual = Number(formData.laborActualCost || 0);
  const expenseActual = Number(formData.expenseActualCost || 0);

  const amountBeforeTax = Number(formData.amountBeforeTax || 0);
  const hasTaxDeduction = formData.hasTaxDeduction || false;

  const totalEstimateCost = materialEstimate + laborEstimate + expenseEstimate;
  const totalSpendingActual = materialActual + laborActual + expenseActual;
  
  const taxDeductionAmount = hasTaxDeduction ? Math.round(amountBeforeTax * 0.033) : 0;
  const finalDepositAmount = amountBeforeTax - taxDeductionAmount;

  // Calculate previously spent (기실행) based on other requests with same lineItemId
  const otherRequests = allSpendingRequests.filter(req => 
    req.lineItemId === formData.lineItemId && req.id !== item?.id
  );

  const materialPreviouslySpent = otherRequests.reduce((sum, req) => sum + (req.materialActualCost || 0), 0);
  const laborPreviouslySpent = otherRequests.reduce((sum, req) => sum + (req.laborActualCost || 0), 0);
  const expensePreviouslySpent = otherRequests.reduce((sum, req) => sum + (req.expenseActualCost || 0), 0);

  const handleChange = (field: keyof SpendingRequestItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const finalData = {
      ...formData,
      totalEstimateCost,
      totalSpendingActual,
      taxDeductionAmount,
      finalDepositAmount,
      materialPreviouslySpent,
      laborPreviouslySpent,
      expensePreviouslySpent,
    };
    onSave(finalData as SpendingRequestItem);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 transition-opacity cursor-default" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-[480px] bg-white dark:bg-zinc-900 shadow-[-8px_0_24px_-12px_rgba(0,0,0,0.3)] dark:shadow-[-8px_0_24px_-12px_rgba(0,0,0,0.7)] z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {item ? "지출결의서 수정" : "새 지출결의서"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 1. 기본 정보 */}
          <Section 
            title="기본 정보" 
            isOpen={openSections.basic} 
            onToggle={() => setOpenSections(prev => ({ ...prev, basic: !prev.basic }))}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>공정</Label>
                <Input 
                  value={formData.processName || ""} 
                  onChange={(e) => handleChange("processName", e.target.value)}
                  placeholder="예: 철거"
                />
              </div>
              <div>
                <Label>세부공정</Label>
                <Input 
                  value={formData.subProcessName || ""} 
                  onChange={(e) => handleChange("subProcessName", e.target.value)}
                  placeholder="예: 주방 철거"
                />
              </div>
              <div className="col-span-2">
                <Label>품목명</Label>
                <Input 
                  value={formData.itemName || ""} 
                  onChange={(e) => handleChange("itemName", e.target.value)}
                />
              </div>
              <div>
                <Label>상태</Label>
                <select
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value as any)}
                >
                  <option value="최초">최초</option>
                  <option value="변경">변경</option>
                  <option value="취소">취소</option>
                </select>
              </div>
              <div>
                <Label>일자</Label>
                <Input 
                  type="date"
                  value={formData.date || ""} 
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isUrgentToday"
                  checked={formData.isUrgentToday}
                  onChange={(e) => handleChange("isUrgentToday", e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isUrgentToday" className="text-sm font-medium text-red-600">당일긴급여부</label>
              </div>
            </div>
          </Section>

          {/* 2. 계좌/정산 */}
          <Section 
            title="계좌/정산" 
            isOpen={openSections.account} 
            onToggle={() => setOpenSections(prev => ({ ...prev, account: !prev.account }))}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>협력업체명</Label>
                  <Input 
                    value={formData.vendorName || ""} 
                    onChange={(e) => handleChange("vendorName", e.target.value)}
                    placeholder="예: 한샘키친"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isExistingVendorAccount"
                  checked={formData.isExistingVendorAccount}
                  onChange={(e) => handleChange("isExistingVendorAccount", e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isExistingVendorAccount" className="text-sm font-medium">기존거래처계좌</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>은행명</Label>
                  <Input 
                    value={formData.bankName || ""} 
                    onChange={(e) => handleChange("bankName", e.target.value)}
                  />
                </div>
                <div>
                  <Label>예금주명</Label>
                  <Input 
                    value={formData.accountHolder || ""} 
                    onChange={(e) => handleChange("accountHolder", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>계좌번호</Label>
                  <Input 
                    value={formData.accountNumber || ""} 
                    onChange={(e) => handleChange("accountNumber", e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">3.3% 원천징수 섹션</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasTaxDeduction"
                      checked={formData.hasTaxDeduction}
                      onChange={(e) => handleChange("hasTaxDeduction", e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="hasTaxDeduction" className="text-sm font-medium">3.3% 공제 여부</label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>3.3% 공제전금액</Label>
                    <Input 
                      type="number"
                      value={formData.amountBeforeTax || ""} 
                      onChange={(e) => handleChange("amountBeforeTax", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>3.3% 공제금액</Label>
                    <div className="pt-2">
                      <Badge color="zinc">{(taxDeductionAmount || 0).toLocaleString()} 원</Badge>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label>최종 입금액</Label>
                    <Badge color="emerald">{(finalDepositAmount || 0).toLocaleString()} 원</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* 3. 비용 내역 */}
          <Section 
            title="비용 내역" 
            isOpen={openSections.costs} 
            onToggle={() => setOpenSections(prev => ({ ...prev, costs: !prev.costs }))}
          >
            <div className="grid grid-cols-5 gap-x-2 gap-y-4 -mx-2">
              <div />
              <Label>견적가</Label>
              <Label>기실행</Label>
              <Label>지출결의</Label>
              <Label>잔여</Label>

              <div className="flex items-center"><Label>재료비</Label></div>
              <Input 
                type="number"
                value={formData.materialEstimateCost || ""} 
                onChange={(e) => handleChange("materialEstimateCost", Number(e.target.value))}
              />
              <div className="pt-2"><Badge color="zinc">{(materialPreviouslySpent || 0).toLocaleString()}</Badge></div>
              <Input 
                type="number"
                value={formData.materialActualCost || ""} 
                onChange={(e) => handleChange("materialActualCost", Number(e.target.value))}
              />
              <div className="pt-2">
                <Badge color={materialEstimate - materialPreviouslySpent - materialActual < 0 ? "red" : "blue"}>
                  {(materialEstimate - materialPreviouslySpent - materialActual).toLocaleString()}
                </Badge>
              </div>

              <div className="flex items-center"><Label>노무비</Label></div>
              <Input 
                type="number"
                value={formData.laborEstimateCost || ""} 
                onChange={(e) => handleChange("laborEstimateCost", Number(e.target.value))}
              />
              <div className="pt-2"><Badge color="zinc">{(laborPreviouslySpent || 0).toLocaleString()}</Badge></div>
              <Input 
                type="number"
                value={formData.laborActualCost || ""} 
                onChange={(e) => handleChange("laborActualCost", Number(e.target.value))}
              />
              <div className="pt-2">
                <Badge color={laborEstimate - laborPreviouslySpent - laborActual < 0 ? "red" : "blue"}>
                  {(laborEstimate - laborPreviouslySpent - laborActual).toLocaleString()}
                </Badge>
              </div>

              <div className="flex items-center"><Label>경비</Label></div>
              <Input 
                type="number"
                value={formData.expenseEstimateCost || ""} 
                onChange={(e) => handleChange("expenseEstimateCost", Number(e.target.value))}
              />
              <div className="pt-2"><Badge color="zinc">{(expensePreviouslySpent || 0).toLocaleString()}</Badge></div>
              <Input 
                type="number"
                value={formData.expenseActualCost || ""} 
                onChange={(e) => handleChange("expenseActualCost", Number(e.target.value))}
              />
              <div className="pt-2">
                <Badge color={expenseEstimate - expensePreviouslySpent - expenseActual < 0 ? "red" : "blue"}>
                  {(expenseEstimate - expensePreviouslySpent - expenseActual).toLocaleString()}
                </Badge>
              </div>
            </div>
          </Section>

          {/* 4. 자동 합산 */}
          <Section 
            title="자동 합산" 
            isOpen={openSections.autoTotals} 
            onToggle={() => setOpenSections(prev => ({ ...prev, autoTotals: !prev.autoTotals }))}
          >
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>견적가 합계</Label>
                <Badge color="blue">{(totalEstimateCost || 0).toLocaleString()} 원</Badge>
              </div>
              <div>
                <Label>지출결의 합계</Label>
                <Badge color="emerald">{(totalSpendingActual || 0).toLocaleString()} 원</Badge>
              </div>
            </div>
          </Section>

          {/* 5. 증빙 정보 */}
          <Section 
            title="증빙 정보" 
            isOpen={openSections.evidence} 
            onToggle={() => setOpenSections(prev => ({ ...prev, evidence: !prev.evidence }))}
          >
            <div className="space-y-4">
              <div>
                <Label>증빙종류</Label>
                <Input 
                  value={formData.evidenceType || ""} 
                  onChange={(e) => handleChange("evidenceType", e.target.value)}
                  placeholder="예: 세금계산서, 영수증"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>증빙사진 (URL)</Label>
                  <Input 
                    value={formData.evidencePhotoUrl || ""} 
                    onChange={(e) => handleChange("evidencePhotoUrl", e.target.value)}
                  />
                </div>
                <div>
                  <Label>작업현황표 (URL)</Label>
                  <Input 
                    value={formData.workStatusSheetUrl || ""} 
                    onChange={(e) => handleChange("workStatusSheetUrl", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>증빙등록안내문구</Label>
                <textarea
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-20"
                  value={formData.evidenceGuide || ""}
                  onChange={(e) => handleChange("evidenceGuide", e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* 6. 구매/배송 */}
          <Section 
            title="구매/배송" 
            isOpen={openSections.delivery} 
            onToggle={() => setOpenSections(prev => ({ ...prev, delivery: !prev.delivery }))}
          >
            <div className="space-y-4">
              <div>
                <Label>구매링크</Label>
                <Input 
                  value={formData.purchaseLink || ""} 
                  onChange={(e) => handleChange("purchaseLink", e.target.value)}
                />
              </div>
              <div>
                <Label>배송지구분</Label>
                <Input 
                  value={formData.deliveryType || ""} 
                  onChange={(e) => handleChange("deliveryType", e.target.value)}
                  placeholder="예: 현장, 사무실"
                />
              </div>
              <div>
                <Label>처리시한메모</Label>
                <Input 
                  value={formData.deadlineMemo || ""} 
                  onChange={(e) => handleChange("deadlineMemo", e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* 7. 기타 */}
          <Section 
            title="기타" 
            isOpen={openSections.others} 
            onToggle={() => setOpenSections(prev => ({ ...prev, others: !prev.others }))}
          >
            <div className="space-y-4">
              <div>
                <Label>메모</Label>
                <textarea
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-20"
                  value={formData.memo || ""}
                  onChange={(e) => handleChange("memo", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>관련자 연락처</Label>
                  <Input 
                    value={formData.contactInfo || ""} 
                    onChange={(e) => handleChange("contactInfo", e.target.value)}
                  />
                </div>
                <div />
                <div>
                  <Label>최초등록일</Label>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{formData.createdAt}</div>
                </div>
                <div>
                  <Label>최종수정일</Label>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{formData.updatedAt}</div>
                </div>
              </div>
            </div>
            </Section>
        </div>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-600/20"
          >
            저장
          </button>
        </div>
      </div>
    </>
  );
}

// Move sub-components outside to prevent re-creation on every render
function Section({ title, isOpen, onToggle, children }: { title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{title}</span>
        <ChevronIcon open={isOpen} />
      </button>
      {isOpen && <div className="p-6 space-y-4">{children}</div>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:bg-zinc-50 dark:disabled:bg-zinc-800 disabled:text-zinc-400"
    />
  );
}

function Badge({ children, color = "emerald" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    blue: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    zinc: "bg-zinc-50 text-zinc-700 border-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    red: "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  };
  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${colors[color]}`}>
      {children}
    </div>
  );
}
