"use client";

import { Battery, Cpu, Layers, MemoryStick, Monitor, Zap } from "lucide-react";
import ClientDeviceSummary from "@/components/ClientDeviceSummary";
import InfoBanner from "@/components/InfoBanner";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { useSystemView } from "@/lib/useSystemView";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function HardwarePage() {
  const { clientData, error, isBrowserFallback, isHostedBrowserMode, load, loading, systemData, viewMode } =
    useSystemView();

  return (
    <div>
      <PageHeader
        title="Hardware"
        description={
          viewMode === "browser"
            ? "Device details available through browser APIs"
            : "CPU, memory, GPU, and battery details"
        }
        onRefresh={load}
        loading={loading}
      />

      {isHostedBrowserMode && (
        <InfoBanner icon={Monitor} title="Hosted device mode" tone="info">
          This page shows the hardware signals the visitor&apos;s browser can safely expose. Exact CPU model, live RAM usage, hostname, disk layout, and processes remain private to the device.
        </InfoBanner>
      )}

      {isBrowserFallback && (
        <InfoBanner icon={Monitor} title="Browser fallback in use" tone="warning">
          The local machine endpoint is unavailable, so the page is showing browser-level device information instead.
        </InfoBanner>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && !systemData && !clientData && (
        <div className="text-sm text-gray-500">Loading hardware info...</div>
      )}

      {viewMode === "browser" && clientData && (
        <ClientDeviceSummary data={clientData} detailed />
      )}

      {viewMode === "system" && systemData && (
        <>
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Cpu size={14} /> Processor
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              <StatCard
                label="CPU Model"
                value={systemData.cpu.brand}
                sub={systemData.cpu.manufacturer}
                icon={Cpu}
                accent="sky"
              />
              <StatCard
                label="Base Speed"
                value={`${systemData.cpu.speed} GHz`}
                accent="sky"
              />
              <StatCard
                label="Cores / Threads"
                value={`${systemData.cpu.physicalCores} / ${systemData.cpu.cores}`}
                sub="Physical / Logical"
                accent="purple"
              />
              <StatCard
                label="Current Load"
                value={`${systemData.cpu.load}%`}
                icon={Zap}
                accent={
                  systemData.cpu.load > 80
                    ? "red"
                    : systemData.cpu.load > 50
                      ? "yellow"
                      : "green"
                }
                bar={systemData.cpu.load}
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <MemoryStick size={14} /> Memory (RAM)
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label="Total RAM"
                value={formatBytes(systemData.memory.total)}
                accent="sky"
              />
              <StatCard
                label="Used"
                value={formatBytes(systemData.memory.used)}
                sub={`${systemData.memory.usedPercent}%`}
                accent={systemData.memory.usedPercent > 85 ? "red" : "yellow"}
                bar={systemData.memory.usedPercent}
              />
              <StatCard
                label="Free"
                value={formatBytes(systemData.memory.free)}
                accent="green"
              />
              <StatCard
                label="Usage"
                value={`${systemData.memory.usedPercent}%`}
                icon={MemoryStick}
                accent={
                  systemData.memory.usedPercent > 85
                    ? "red"
                    : systemData.memory.usedPercent > 60
                      ? "yellow"
                      : "green"
                }
                bar={systemData.memory.usedPercent}
              />
            </div>
          </section>

          {systemData.gpu.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <Layers size={14} /> GPU
              </h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {systemData.gpu.map((gpu, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-800 bg-gray-900 p-5"
                  >
                    <div className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                      GPU {index + 1}
                    </div>
                    <div className="mb-1 text-lg font-bold text-white">{gpu.model}</div>
                    <div className="text-sm text-gray-400">{gpu.vendor}</div>
                    {gpu.vram ? (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500">VRAM:</span>
                        <span className="text-sm font-semibold text-purple-400">
                          {gpu.vram} MB
                        </span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Monitor size={14} /> Operating System
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              <StatCard
                label="OS"
                value={systemData.os.distro || systemData.os.platform}
                sub={systemData.os.release}
                icon={Monitor}
                accent="sky"
              />
              <StatCard label="Kernel" value={systemData.os.kernel} accent="sky" />
              <StatCard
                label="Architecture"
                value={systemData.os.arch}
                accent="purple"
              />
              <StatCard
                label="Hostname"
                value={systemData.os.hostname}
                accent="sky"
              />
              <StatCard
                label="Platform"
                value={systemData.os.platform}
                accent="sky"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Battery size={14} /> Battery
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {systemData.battery.hasBattery ? (
                <>
                  <StatCard
                    label="Charge"
                    value={`${systemData.battery.percent}%`}
                    sub={systemData.battery.isCharging ? "Charging" : "On battery"}
                    icon={Battery}
                    accent={
                      systemData.battery.percent < 20
                        ? "red"
                        : systemData.battery.isCharging
                          ? "green"
                          : "yellow"
                    }
                    bar={systemData.battery.percent}
                  />
                  <StatCard
                    label="Status"
                    value={systemData.battery.isCharging ? "Charging" : "Discharging"}
                    accent={systemData.battery.isCharging ? "green" : "yellow"}
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
        </>
      )}
    </div>
  );
}
