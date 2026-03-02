export type EstimateStatus =
  | "견적중"
  | "계약완료"
  | "공사중"
  | "추가공사"
  | "공사완료"
  | "정산완료";

export interface PaymentMilestone {
  date: string;
  percentage: number;
  amount: number;
}

export interface EstimateLineItem {
  id: string;
  category: string;
  name: string;
  spec: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  note: string;
}

export interface Estimate {
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
}
