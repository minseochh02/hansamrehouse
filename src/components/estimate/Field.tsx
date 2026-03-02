export function Field({ 
  label, 
  value, 
  onChange,
  type = "text"
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void;
  type?: "text" | "date" | "number";
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-sm text-zinc-900 dark:text-zinc-100">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="미입력"
          className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 py-0.5 text-sm"
        />
      </dd>
    </div>
  );
}
