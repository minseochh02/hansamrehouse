import type { EstimateStatus } from "@/types/estimate";
import { STATUS_STYLES } from "./constants";

export function StatusBadge({ status }: { status: EstimateStatus }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}
