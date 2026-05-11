"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import { Cpu, MemoryStick, Monitor, Battery, Zap, Layers } from "lucide-react";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function HardwarePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/system");
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch {
      setError("Could not load hardware info.");
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
        title="Hardware"
        description="CPU, memory, GPU, and battery details"
        onRefresh={load}
        loading={loading}
      />

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="text-gray-500 text-sm">Loading hardware info...</div>
      )}

      {data && (
        <>
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Cpu size={14} /> Processor
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="CPU Model"
                value={data.cpu.brand}
                sub={data.cpu.manufacturer}
                icon={Cpu}
                accent="sky"
              />
              <StatCard
                label="Base Speed"
                value={`${data.cpu.speed} GHz`}
                accent="sky"
              />
              <StatCard
                label="Cores / Threads"
                value={`${data.cpu.physicalCores} / ${data.cpu.cores}`}
                sub="Physical / Logical"
                accent="purple"
              />
              <StatCard
                label="Current Load"
                value={`${data.cpu.load}%`}
                icon={Zap}
                accent={data.cpu.load > 80 ? "red" : data.cpu.load > 50 ? "yellow" : "green"}
                bar={data.cpu.load}
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MemoryStick size={14} /> Memory (RAM)
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total RAM"
                value={formatBytes(data.memory.total)}
                accent="sky"
              />
              <StatCard
                label="Used"
                value={formatBytes(data.memory.used)}
                sub={`${data.memory.usedPercent}%`}
                accent={data.memory.usedPercent > 85 ? "red" : "yellow"}
                bar={data.memory.usedPercent}
              />
              <StatCard
                label="Free"
                value={formatBytes(data.memory.free)}
                accent="green"
              />
              <StatCard
                label="Usage"
                value={`${data.memory.usedPercent}%`}
                icon={MemoryStick}
                accent={data.memory.usedPercent > 85 ? "red" : data.memory.usedPercent > 60 ? "yellow" : "green"}
                bar={data.memory.usedPercent}
              />
            </div>
          </section>

          {data.gpu.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers size={14} /> GPU
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {data.gpu.map((g: any, i: number) => (
                  <div
                    key={i}
                    className="bg-gray-900 rounded-xl border border-gray-800 p-5"
                  >
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      GPU {i + 1}
                    </div>
                    <div className="text-lg font-bold text-white mb-1">{g.model}</div>
                    <div className="text-sm text-gray-400">{g.vendor}</div>
                    {g.vram && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500">VRAM:</span>
                        <span className="text-sm font-semibold text-purple-400">
                          {g.vram} MB
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Monitor size={14} /> Operating System
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="OS"
                value={data.os.distro || data.os.platform}
                sub={data.os.release}
                icon={Monitor}
                accent="sky"
              />
              <StatCard
                label="Kernel"
                value={data.os.kernel}
                accent="sky"
              />
              <StatCard
                label="Architecture"
                value={data.os.arch}
                accent="purple"
              />
              <StatCard
                label="Hostname"
                value={data.os.hostname}
                accent="sky"
              />
              <StatCard
                label="Platform"
                value={data.os.platform}
                accent="sky"
              />
            </div>
          </section>

          {data.battery && (
            <section className="mb-8">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Battery size={14} /> Battery
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {data.battery.hasBattery ? (
                  <>
                    <StatCard
                      label="Charge"
                      value={`${data.battery.percent}%`}
                      sub={data.battery.isCharging ? "Charging" : "On battery"}
                      icon={Battery}
                      accent={data.battery.percent < 20 ? "red" : data.battery.isCharging ? "green" : "yellow"}
                      bar={data.battery.percent}
                    />
                    <StatCard
                      label="Status"
                      value={data.battery.isCharging ? "Charging" : "Discharging"}
                      accent={data.battery.isCharging ? "green" : "yellow"}
                    />
                  </>
                ) : (
                  <StatCard
                    label="Battery"
                    value="No battery detected"
                    sub="Likely a desktop or AC-powered device"
                    icon={Battery}
                    accent="sky"
                  />
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
