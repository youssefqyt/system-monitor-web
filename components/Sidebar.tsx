"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Network,
  Cpu,
  Activity,
  HardDrive,
  Wifi,
  Monitor,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ports", label: "Ports & Services", icon: Network },
  { href: "/hardware", label: "Hardware", icon: Cpu },
  { href: "/processes", label: "Processes", icon: Activity },
  { href: "/disks", label: "Disks", icon: HardDrive },
  { href: "/network", label: "Network", icon: Wifi },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
        <Monitor className="text-sky-500 shrink-0" size={22} />
        <span className="font-bold text-white text-sm tracking-wide">
          SysMonitor
        </span>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === href
                ? "bg-sky-600 text-white font-medium"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-gray-800 text-xs text-gray-600">
        Localhost: full system data. Hosted: browser-safe device data.
      </div>
    </aside>
  );
}
