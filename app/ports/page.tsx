"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import { Network } from "lucide-react";

export default function PortsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ports");
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch {
      setError("Could not load port information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = data.filter(
    (p) =>
      String(p.localPort).includes(search) ||
      String(p.pid).includes(search) ||
      p.protocol?.toLowerCase().includes(search.toLowerCase()) ||
      p.localAddress?.includes(search)
  );

  return (
    <div>
      <PageHeader
        title="Ports & Services"
        description="All listening ports on your machine"
        onRefresh={load}
        loading={loading}
      />

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Filter by port, PID, protocol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />
        </div>
        <span className="text-xs text-gray-500">
          {filtered.length} service{filtered.length !== 1 ? "s" : ""} listening
        </span>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Port
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Protocol
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                PID
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                State
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Open in browser
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-600 text-sm">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-600 text-sm">
                  No listening ports found
                </td>
              </tr>
            ) : (
              filtered.map((port, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-sky-400">
                      {port.localPort}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-400 text-xs">
                    {port.localAddress || "0.0.0.0"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 font-mono uppercase">
                      {port.protocol}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-400 text-xs">
                    {port.pid || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-green-950 text-green-400 border border-green-900">
                      {port.state}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {port.protocol === "tcp" && (
                      <a
                        href={`http://localhost:${port.localPort}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-500 hover:text-sky-300 underline"
                      >
                        localhost:{port.localPort}
                      </a>
                    )}
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
