import type { EstimateStatus } from "@/types/estimate";

export const STATUS_STYLES: Record<EstimateStatus, string> = {
  상담접수: "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300",
  견적중: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  계약완료: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  공사중: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  공사완료: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  추가공사중: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  추가공사완료: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
};
