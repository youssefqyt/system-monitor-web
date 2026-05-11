"use client";

import { useEffect, useState, useCallback } from "react";
import InfoBanner from "@/components/InfoBanner";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import { Wifi, ArrowDown, ArrowUp } from "lucide-react";
import { useAccessMode } from "@/lib/accessMode";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatSpeed(bps: number) {
  if (!bps) return "0 B/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bps) / Math.log(k));
  return parseFloat((bps / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function NetworkPage() {
  const accessMode = useAccessMode();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/network");
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch {
      setError("Could not load network info.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accessMode !== "local") {
      setLoading(false);
      return;
    }

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [accessMode, load]);

  const activeIfaces = data?.interfaces.filter(
    (i: any) => !i.internal && i.operstate === "up"
  ) ?? [];

  return (
    <div>
      <PageHeader
        title="Network"
        description={
          accessMode === "browser"
            ? "Detailed network interfaces require local machine access"
            : "Interfaces and live bandwidth — refreshes every 3 seconds"
        }
        onRefresh={accessMode === "local" ? load : undefined}
        loading={loading}
      />

      {accessMode === "browser" && (
        <InfoBanner icon={Wifi} title="Browser privacy limit" tone="warning">
          Browsers do not expose the visitor&apos;s network interfaces, MAC address, local IP map, or per-interface bandwidth. This page is only accurate when the app is opened locally on the monitored machine.
        </InfoBanner>
      )}

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      {loading && !data && accessMode !== "browser" && (
        <div className="text-gray-500 text-sm">Loading network info...</div>
      )}

      {accessMode === "browser"
        ? null
        : data && (
        <>
          {data.default && (
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
              <Wifi size={14} className="text-sky-400" />
              Default interface:{" "}
              <span className="font-semibold text-sky-400">{data.default}</span>
            </div>
          )}

          {data.stats.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Live Bandwidth
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {data.stats.slice(0, 2).map((s: any) => (
                  <>
                    <StatCard
                      key={`${s.iface}-rx`}
                      label={`${s.iface} — Download`}
                      value={formatSpeed(s.rx_sec ?? 0)}
                      sub={`Total: ${formatBytes(s.rx_bytes)}`}
                      icon={ArrowDown}
                      accent="green"
                    />
                    <StatCard
                      key={`${s.iface}-tx`}
                      label={`${s.iface} — Upload`}
                      value={formatSpeed(s.tx_sec ?? 0)}
                      sub={`Total: ${formatBytes(s.tx_bytes)}`}
                      icon={ArrowUp}
                      accent="sky"
                    />
                  </>
                ))}
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Network Interfaces
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.interfaces.map((iface: any, i: number) => (
                <div
                  key={i}
                  className={`bg-gray-900 border rounded-xl p-5 ${
                    iface.operstate === "up" && !iface.internal
                      ? "border-green-900/40"
                      : "border-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Wifi
                        size={16}
                        className={
                          iface.operstate === "up"
                            ? "text-green-400"
                            : "text-gray-600"
                        }
                      />
                      <span className="font-semibold text-white">
                        {iface.iface}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          iface.operstate === "up"
                            ? "bg-green-950 text-green-400 border border-green-900"
                            : "bg-gray-800 text-gray-500"
                        }`}
                      >
                        {iface.operstate}
                      </span>
                      {iface.internal && (
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-500">
                          internal
                        </span>
                      )}
                      {iface.virtual && (
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-500">
                          virtual
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {iface.ip4 && (
                      <>
                        <div className="text-gray-500 text-xs">IPv4</div>
                        <div className="font-mono text-xs text-sky-400">{iface.ip4}</div>
                      </>
                    )}
                    {iface.ip6 && (
                      <>
                        <div className="text-gray-500 text-xs">IPv6</div>
                        <div className="font-mono text-xs text-sky-400 break-all">{iface.ip6}</div>
                      </>
                    )}
                    {iface.mac && (
                      <>
                        <div className="text-gray-500 text-xs">MAC</div>
                        <div className="font-mono text-xs text-gray-400">{iface.mac}</div>
                      </>
                    )}
                    {iface.type && (
                      <>
                        <div className="text-gray-500 text-xs">Type</div>
                        <div className="text-xs text-gray-400">{iface.type}</div>
                      </>
                    )}
                    {iface.speed && (
                      <>
                        <div className="text-gray-500 text-xs">Speed</div>
                        <div className="text-xs text-gray-400">{iface.speed} Mbps</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
