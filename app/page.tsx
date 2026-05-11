"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import { Cpu, MemoryStick, Monitor, Battery, Zap } from "lucide-react";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/system");
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch {
      setError("Could not load system info.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div>
      <PageHeader
        title="System Dashboard"
        description="Live overview of your machine — refreshes every 5 seconds"
        onRefresh={load}
        loading={loading}
      />

      {data?.isVercel && (
        <div className="rounded-xl border border-blue-800 bg-blue-950/40 p-4 text-sm text-blue-400 mb-6 flex items-start gap-3">
          <Monitor className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-1">Serverless Environment Detected</p>
            <p className="opacity-80">
              You are running this on Vercel. Hardware metrics reflect the serverless function environment, not your local machine. Some metrics may be unavailable or restricted.
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
        <div className="text-gray-500 text-sm">Loading system info...</div>
      )}

      {data && (
        <>
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              CPU
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Processor"
                value={data.cpu.brand}
                sub={data.cpu.manufacturer}
                icon={Cpu}
                accent="sky"
              />
              <StatCard
                label="CPU Load"
                value={`${data.cpu.load}%`}
                sub={`${data.cpu.speed} GHz base`}
                icon={Zap}
                accent={data.cpu.load > 80 ? "red" : data.cpu.load > 50 ? "yellow" : "green"}
                bar={data.cpu.load}
              />
              <StatCard
                label="Cores"
                value={data.cpu.cores}
                sub={`${data.cpu.physicalCores} physical`}
                accent="purple"
              />
              <StatCard
                label="Speed"
                value={`${data.cpu.speed} GHz`}
                accent="sky"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Memory
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="RAM Used"
                value={`${data.memory.usedPercent}%`}
                sub={`${formatBytes(data.memory.used)} / ${formatBytes(data.memory.total)}`}
                icon={MemoryStick}
                accent={data.memory.usedPercent > 85 ? "red" : data.memory.usedPercent > 60 ? "yellow" : "green"}
                bar={data.memory.usedPercent}
              />
              <StatCard
                label="Total RAM"
                value={formatBytes(data.memory.total)}
                accent="sky"
              />
              <StatCard
                label="Used"
                value={formatBytes(data.memory.used)}
                accent="yellow"
              />
              <StatCard
                label="Free"
                value={formatBytes(data.memory.free)}
                accent="green"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              System
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="OS"
                value={data.os.distro || data.os.platform}
                sub={data.os.release}
                icon={Monitor}
                accent="sky"
              />
              <StatCard
                label="Hostname"
                value={data.os.hostname}
                accent="purple"
              />
              <StatCard
                label="Architecture"
                value={data.os.arch}
                sub={`Kernel ${data.os.kernel}`}
                accent="sky"
              />
              {data.battery.hasBattery ? (
                <StatCard
                  label="Battery"
                  value={`${data.battery.percent}%`}
                  sub={data.battery.isCharging ? "Charging" : "Discharging"}
                  icon={Battery}
                  accent={data.battery.percent < 20 ? "red" : data.battery.isCharging ? "green" : "yellow"}
                  bar={data.battery.percent}
                />
              ) : (
                <StatCard
                  label="Battery"
                  value="No battery"
                  sub="Desktop / AC power"
                  icon={Battery}
                  accent="sky"
                />
              )}
            </div>
          </section>

          {data.gpu.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                GPU
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {data.gpu.map((g: any, i: number) => (
                  <StatCard
                    key={i}
                    label={`GPU ${i + 1}`}
                    value={g.model}
                    sub={g.vram ? `${g.vram} MB VRAM — ${g.vendor}` : g.vendor}
                    accent="purple"
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
