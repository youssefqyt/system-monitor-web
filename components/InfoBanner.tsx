import clsx from "clsx";
import type { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

interface InfoBannerProps {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
  tone?: "info" | "warning";
}

const toneMap = {
  info: {
    border: "border-blue-800",
    icon: "text-blue-400",
    surface: "bg-blue-950/40",
    text: "text-blue-300",
  },
  warning: {
    border: "border-yellow-800/60",
    icon: "text-yellow-300",
    surface: "bg-yellow-950/30",
    text: "text-yellow-200",
  },
};

export default function InfoBanner({
  children,
  icon: Icon,
  title,
  tone = "info",
}: InfoBannerProps) {
  const colors = toneMap[tone];

  return (
    <div
      className={clsx(
        "mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm",
        colors.border,
        colors.surface,
        colors.text
      )}
    >
      <Icon className={clsx("mt-0.5 h-5 w-5 shrink-0", colors.icon)} />
      <div>
        <p className="mb-1 font-semibold">{title}</p>
        <div className="opacity-90">{children}</div>
      </div>
    </div>
  );
}
