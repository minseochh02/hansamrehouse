export type EstimateStatus =
  | "상담접수"
  | "견적중"
  | "계약완료"
  | "공사중"
  | "공사완료"
  | "추가공사중"
  | "추가공사완료";

export interface PaymentMilestone {
  date: string;
  percentage: number;
  amount: number;
}

export interface EstimateLineItem {
  id: string;
  category: string;
  subCategory: string;
  name: string;
  unit: string;
  quantity: number;
  materialUnitPrice: number; // 재료비 단가
  laborUnitPrice: number; // 노무비 단가
  expenseUnitPrice: number; // 경비 단가
  unitPrice: number; // 총 단가 (합계)
  amount: number;
  note: string;
}

export interface AdditionalLineItem {
  id: string;
  requestDate: string;
  location: string;
  name: string;
  materialCost: number; // 재료비
  laborCost: number; // 노무비
  expense: number; // 경비
  additionalAmount: number; // 추가 금액 (재료비 + 노무비 + 경비)
  originalAmount: number;
  totalAmount: number;
}

export interface SpendingRequestItem {
  id: string;
  lineItemId?: string; // 내역서 항목 ID 연동
  processName: string; // 공정명
  subProcessName: string; // 세부공정명
  itemName: string; // 품목명
  status?: "최초" | "변경" | "취소"; // 상태 (Deprecated)
  
  // 비용 내역
  materialEstimateCost: number; // 재료비견적가
  materialActualCost: number; // 재료비
  laborEstimateCost: number; // 노무비견적가
  laborActualCost: number; // 노무비
  expenseEstimateCost: number; // 경비견적가
  expenseActualCost: number; // 경비
  
  // 기실행 비용 (Auto-calculated or Manual)
  materialPreviouslySpent: number; // 기실행재료비
  laborPreviouslySpent: number; // 기실행노무비
  expensePreviouslySpent: number; // 기실행경비
  
  // 합계 (Auto-calculated)
  totalEstimateCost: number; // 견적가합계
  totalSpendingActual: number; // 지출결의합계
  
  // 증빙 정보
  evidenceType: string; // 증빙종류
  evidencePhotoUrl: string; // 증빙사진
  workStatusSheetUrl: string; // 작업현황표
  evidenceGuide: string; // 증빙등록안내문구
  
  // 구매/배송
  isUrgentToday: boolean; // 당일긴급여부
  deadlineMemo: string; // 처리시한메모
  purchaseLink: string; // 구매링크
  deliveryType: string; // 배송지구분
  
  // 계좌/정산
  vendorName: string; // 협력업체명
  isExistingVendorAccount: boolean; // 기존거래처계좌
  bankName: string; // 은행명
  accountHolder: string; // 예금주명
  accountNumber: string; // 계좌번호
  
  // 3.3% 공제
  amountBeforeTax: number; // 3.3공제전금액
  hasTaxDeduction: boolean; // 3.3공제여부
  taxDeductionAmount: number; // 3.3공제금액
  finalDepositAmount: number; // 입금액
  
  // 기타
  memo: string; // 메모
  date: string; // 일자
  contactInfo: string; // 관련자연락처
  paymentStatus: "대기" | "완료" | "반려" | "임시저장"; // 결제상태
  isAdditional?: boolean; // 추가 견적 항목 여부
  createdAt: string; // 최초등록일
  updatedAt: string; // 최종수정일
}

export interface Estimate {
  customerName: string;
  shortAddress: string;
  estimateDate: string;
  constructionStartDate: string;
  constructionEndDate: string;
  additionalEstimateDate: string;
  additionalConstructionStartDate: string;
  additionalConstructionEndDate: string;
  manager: string;
  siteManager: string;
  estimateCode: string;
  estimateStatus: EstimateStatus;
  siteCode: string;
  totalAmount: number;
  contract: PaymentMilestone;
  commencement: PaymentMilestone;
  midterm: PaymentMilestone;
  moveInCleaningDate: string;
  balance: PaymentMilestone;
  lineItems: EstimateLineItem[];
  additionalLineItems: AdditionalLineItem[];
  spendingRequests: SpendingRequestItem[];
}

export interface SpendingFilter {
  type: "category" | "subCategory" | "itemName" | "vendorName" | "none";
  value: string;
}

export interface MasterCategory {
  id: string;
  name: string;
  displayOrder: number;
}

export interface MasterSubCategory {
  id: string;
  name: string;
  categoryId: string;
  displayOrder: number;
}

export interface MasterItem {
  id: string;
  processName: string;
  subProcessName: string;
  itemName: string;
  unit: string;
}

export interface Vendor {
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
