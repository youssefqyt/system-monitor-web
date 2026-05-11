import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "SysMonitor — System Information Dashboard",
  description: "Monitor your computer's hardware, services, and processes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-950">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </body>
    </html>
  );
}
