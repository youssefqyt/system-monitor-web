"use client";

import { Battery, Cpu, MemoryStick, Monitor, Zap } from "lucide-react";
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

export default function DashboardPage() {
  const { clientData, error, isBrowserFallback, isHostedBrowserMode, load, loading, systemData, viewMode } =
    useSystemView({ refreshInterval: 5000 });

  const titleDescription =
    viewMode === "browser"
      ? "Device overview from browser APIs for the current visitor"
      : "Live overview of your machine — refreshes every 5 seconds";

  return (
    <div>
      <PageHeader
        title="System Dashboard"
        description={titleDescription}
        onRefresh={load}
        loading={loading}
      />

      {isHostedBrowserMode && (
        <InfoBanner icon={Monitor} title="Per-visitor browser mode" tone="info">
          This hosted page now reads the connected device through browser APIs instead of the Vercel server. CPU model, live RAM usage, disks, and processes stay hidden because browsers do not expose them.
        </InfoBanner>
      )}

      {isBrowserFallback && (
        <InfoBanner icon={Monitor} title="Browser fallback in use" tone="warning">
          The local system API did not respond, so this page is showing browser-level device data for the current tab.
        </InfoBanner>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && !systemData && !clientData && (
        <div className="text-sm text-gray-500">Loading system info...</div>
      )}

      {viewMode === "browser" && clientData && <ClientDeviceSummary data={clientData} />}

      {viewMode === "system" && systemData && (
        <>
          <section className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              CPU
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label="Processor"
                value={systemData.cpu.brand}
                sub={systemData.cpu.manufacturer}
                icon={Cpu}
                accent="sky"
              />
              <StatCard
                label="CPU Load"
                value={`${systemData.cpu.load}%`}
                sub={`${systemData.cpu.speed} GHz base`}
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
              <StatCard
                label="Cores"
                value={systemData.cpu.cores}
                sub={`${systemData.cpu.physicalCores} physical`}
                accent="purple"
              />
              <StatCard
                label="Speed"
                value={`${systemData.cpu.speed} GHz`}
                accent="sky"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Memory
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label="RAM Used"
                value={`${systemData.memory.usedPercent}%`}
                sub={`${formatBytes(systemData.memory.used)} / ${formatBytes(systemData.memory.total)}`}
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
              <StatCard
                label="Total RAM"
                value={formatBytes(systemData.memory.total)}
                accent="sky"
              />
              <StatCard
                label="Used"
                value={formatBytes(systemData.memory.used)}
                accent="yellow"
              />
              <StatCard
                label="Free"
                value={formatBytes(systemData.memory.free)}
                accent="green"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              System
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label="OS"
                value={systemData.os.distro || systemData.os.platform}
                sub={systemData.os.release}
                icon={Monitor}
                accent="sky"
              />
              <StatCard
                label="Hostname"
                value={systemData.os.hostname}
                accent="purple"
              />
              <StatCard
                label="Architecture"
                value={systemData.os.arch}
                sub={`Kernel ${systemData.os.kernel}`}
                accent="sky"
              />
              {systemData.battery.hasBattery ? (
                <StatCard
                  label="Battery"
                  value={`${systemData.battery.percent}%`}
                  sub={systemData.battery.isCharging ? "Charging" : "Discharging"}
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

          {systemData.gpu.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                GPU
              </h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {systemData.gpu.map((gpu, index) => (
                  <StatCard
                    key={index}
                    label={`GPU ${index + 1}`}
                    value={gpu.model}
                    sub={gpu.vram ? `${gpu.vram} MB VRAM — ${gpu.vendor}` : gpu.vendor}
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
