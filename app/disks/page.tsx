"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import { HardDrive } from "lucide-react";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function DisksPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/disks");
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch {
      setError("Could not load disk info.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Disks"
        description="Physical disks and filesystem usage"
        onRefresh={load}
        loading={loading}
      />

      {data?.isVercel && (
        <div className="rounded-xl border border-blue-800 bg-blue-950/40 p-4 text-sm text-blue-400 mb-6 flex items-start gap-3">
          <HardDrive className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-1">Serverless Environment Detected</p>
            <p className="opacity-80">
              Disk information on Vercel is restricted. You are seeing metrics for the ephemeral serverless container.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="text-gray-500 text-sm">Loading disk info...</div>
      )}

      {data && (
        <>
          {data.physical.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <HardDrive size={14} /> Physical Drives
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {data.physical.map((d: any, i: number) => (
                  <div
                    key={i}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <HardDrive size={20} className="text-sky-400" />
                      <div>
                        <div className="font-semibold text-white">{d.name || `Disk ${i + 1}`}</div>
                        <div className="text-xs text-gray-500">{d.vendor || d.type}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Size</div>
                        <div className="font-semibold text-white">{formatBytes(d.size)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Type</div>
                        <div className="font-semibold text-white">{d.type || "—"}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Interface</div>
                        <div className="font-semibold text-white">{d.interfaceType || "—"}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Vendor</div>
                        <div className="font-semibold text-white">{d.vendor || "—"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.filesystems.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Filesystems
              </h2>
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">FS</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Used</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Available</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.filesystems.map((f: any, i: number) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/40">
                        <td className="px-4 py-3 font-mono text-xs text-sky-400">{f.mount}</td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{f.fs}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 font-mono">
                            {f.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-300">{formatBytes(f.size)}</td>
                        <td className="px-4 py-3 text-xs text-gray-300">{formatBytes(f.used)}</td>
                        <td className="px-4 py-3 text-xs text-gray-300">{formatBytes(f.available)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-800 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  f.usePercent > 85 ? "bg-red-500" : f.usePercent > 60 ? "bg-yellow-500" : "bg-sky-500"
                                }`}
                                style={{ width: `${Math.min(f.usePercent, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-gray-400">
                              {Math.round(f.usePercent)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Disk I/O
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Read Ops" value={data.io.rIO?.toLocaleString() ?? "—"} accent="sky" />
              <StatCard label="Write Ops" value={data.io.wIO?.toLocaleString() ?? "—"} accent="purple" />
              <StatCard label="Read/sec" value={data.io.rIO_sec ? `${Math.round(data.io.rIO_sec)}/s` : "—"} accent="green" />
              <StatCard label="Write/sec" value={data.io.wIO_sec ? `${Math.round(data.io.wIO_sec)}/s` : "—"} accent="yellow" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
