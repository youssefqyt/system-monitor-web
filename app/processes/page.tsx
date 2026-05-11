"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/PageHeader";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function ProcessesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"cpu" | "mem">("cpu");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/processes");
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch {
      setError("Could not load process list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const processes = data?.list ?? [];
  const filtered = processes
    .filter(
      (p: any) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(p.pid).includes(search) ||
        p.user?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => b[sortBy] - a[sortBy]);

  return (
    <div>
      <PageHeader
        title="Processes"
        description="Top 50 processes by CPU usage — refreshes every 5 seconds"
        onRefresh={load}
        loading={loading}
      />

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      {data && (
        <div className="flex gap-4 mb-5">
          <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-white">{data.all}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total</div>
          </div>
          <div className="bg-gray-900 border border-green-900/40 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-green-400">{data.running}</div>
            <div className="text-xs text-gray-500 mt-0.5">Running</div>
          </div>
          <div className="bg-gray-900 border border-yellow-900/40 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{data.sleeping}</div>
            <div className="text-xs text-gray-500 mt-0.5">Sleeping</div>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Filter by name, PID, user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 w-72"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("cpu")}
            className={`text-xs px-3 py-2 rounded-lg transition-colors ${
              sortBy === "cpu"
                ? "bg-sky-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Sort by CPU
          </button>
          <button
            onClick={() => setSortBy("mem")}
            className={`text-xs px-3 py-2 rounded-lg transition-colors ${
              sortBy === "mem"
                ? "bg-sky-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Sort by Memory
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                PID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                CPU %
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mem %
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                RSS
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                State
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-600">
                  Loading...
                </td>
              </tr>
            ) : (
              filtered.map((p: any) => (
                <tr
                  key={p.pid}
                  className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500">
                    {p.pid}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-white">{p.name}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-800 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-sky-500"
                          style={{ width: `${Math.min(p.cpu, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono ${p.cpu > 50 ? "text-red-400" : p.cpu > 20 ? "text-yellow-400" : "text-gray-400"}`}>
                        {p.cpu.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-400">
                    {p.mem.toFixed(1)}%
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-400">
                    {formatBytes((p.memRss ?? 0) * 1024)}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-400">
                    {p.user || "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      p.state === "running"
                        ? "bg-green-950 text-green-400 border border-green-900"
                        : "bg-gray-800 text-gray-500"
                    }`}>
                      {p.state}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
