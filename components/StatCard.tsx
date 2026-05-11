import clsx from "clsx";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  accent?: "sky" | "green" | "yellow" | "red" | "purple";
  bar?: number;
}

const accentMap = {
  sky: { icon: "text-sky-400", bar: "bg-sky-500", border: "border-sky-900/40" },
  green: { icon: "text-green-400", bar: "bg-green-500", border: "border-green-900/40" },
  yellow: { icon: "text-yellow-400", bar: "bg-yellow-500", border: "border-yellow-900/40" },
  red: { icon: "text-red-400", bar: "bg-red-500", border: "border-red-900/40" },
  purple: { icon: "text-purple-400", bar: "bg-purple-500", border: "border-purple-900/40" },
};

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "sky",
  bar,
}: StatCardProps) {
  const colors = accentMap[accent];
  return (
    <div
      className={clsx(
        "bg-gray-900 rounded-xl border p-5 flex flex-col gap-3",
        colors.border
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          {label}
        </span>
        {Icon && <Icon size={16} className={colors.icon} />}
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
      </div>
      {bar !== undefined && (
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div
            className={clsx("h-1.5 rounded-full transition-all", colors.bar)}
            style={{ width: `${Math.min(bar, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
