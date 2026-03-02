import type { Estimate, PaymentMilestone } from "@/types/estimate";

export function PaymentTimeline({ 
  estimate,
  onMilestoneChange,
  onMoveInCleaningDateChange
}: { 
  estimate: Estimate;
  onMilestoneChange: (milestone: "contract" | "commencement" | "midterm" | "balance", field: keyof PaymentMilestone, value: any) => void;
  onMoveInCleaningDateChange: (val: string) => void;
}) {
  const milestones: { label: string; key: "contract" | "commencement" | "midterm" | "balance"; data: PaymentMilestone }[] = [
    { label: "계약금", key: "contract", data: estimate.contract },
    { label: "착수금", key: "commencement", data: estimate.commencement },
    { label: "중도금", key: "midterm", data: estimate.midterm },
    { label: "잔금", key: "balance", data: estimate.balance },
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
              <div className="flex items-center gap-0.5">
                <input
                  type="number"
                  value={m.data.percentage}
                  onChange={(e) => onMilestoneChange(m.key, "percentage", Number(e.target.value))}
                  className="w-10 text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-0.5 text-right"
                />
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <input
                type="date"
                value={m.data.date}
                onChange={(e) => onMilestoneChange(m.key, "date", e.target.value)}
                placeholder="날짜 미정"
                className="text-sm text-zinc-600 dark:text-zinc-400 bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 py-0.5 w-32"
              />
              <span className="text-zinc-300">&middot;</span>
              <div className="flex items-center gap-0.5">
                <input
                  type="number"
                  value={m.data.amount}
                  onChange={(e) => onMilestoneChange(m.key, "amount", Number(e.target.value))}
                  className="text-sm text-zinc-600 dark:text-zinc-400 bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 w-32 font-mono text-right"
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">원</span>
              </div>
            </div>
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
          <div className="mt-0.5">
            <input
              type="date"
              value={estimate.moveInCleaningDate}
              onChange={(e) => onMoveInCleaningDateChange(e.target.value)}
              placeholder="날짜 미정"
              className="text-sm text-zinc-600 dark:text-zinc-400 bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 py-0.5 w-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
