import {
  Battery,
  Cpu,
  Globe,
  HardDrive,
  Layers,
  MemoryStick,
  Monitor,
  Smartphone,
  Wifi,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import type { ClientSystemInfo } from "@/lib/clientInfo";

interface ClientDeviceSummaryProps {
  data: ClientSystemInfo;
  detailed?: boolean;
}

function formatBytes(bytes?: number) {
  if (!bytes) return "Unavailable";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / 1024 ** exponent).toFixed(1)} ${units[exponent]}`;
}

function formatRam(deviceMemory?: number) {
  return deviceMemory ? `~${deviceMemory} GB` : "Not exposed";
}

function formatBattery(data: ClientSystemInfo["battery"]) {
  if (!data.hasBattery) return "No battery reported";
  return `${data.percent}%`;
}

function formatBatterySub(data: ClientSystemInfo["battery"]) {
  if (!data.hasBattery) {
    return "Battery API unavailable or device has no battery";
  }

  return data.isCharging ? "Charging" : "On battery";
}

function formatConnection(data: ClientSystemInfo["network"]) {
  return data.effectiveType || data.type || (data.online ? "Online" : "Offline");
}

function formatDeviceType(data: ClientSystemInfo["device"]) {
  if (data.model) return data.model;
  if (data.isMobileLike) return "Mobile device";
  if (data.isTouchDevice) return "Touch-capable device";
  return "Desktop or laptop";
}

function formatPlatform(data: ClientSystemInfo["os"]) {
  return data.osVersion ? `${data.osName} ${data.osVersion}` : data.osName;
}

export default function ClientDeviceSummary({
  data,
  detailed = false,
}: ClientDeviceSummaryProps) {
  return (
    <>
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <Smartphone size={14} /> Device
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Operating System"
            value={formatPlatform(data.os)}
            sub={data.os.platform}
            icon={Monitor}
            accent="sky"
          />
          <StatCard
            label="Browser"
            value={data.os.browserName}
            sub={data.os.browserVersion || "Version unavailable"}
            icon={Globe}
            accent="purple"
          />
          <StatCard
            label="Device"
            value={formatDeviceType(data.device)}
            sub={`${data.device.maxTouchPoints} touch point${data.device.maxTouchPoints === 1 ? "" : "s"}`}
            icon={Smartphone}
            accent="green"
          />
          <StatCard
            label="Screen"
            value={`${data.screen.width} x ${data.screen.height}`}
            sub={`${data.screen.colorDepth}-bit color`}
            icon={Monitor}
            accent="sky"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <Cpu size={14} /> Hardware Signals
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Logical Cores"
            value={data.cpu.cores || "Unknown"}
            sub="Reported by the browser"
            icon={Cpu}
            accent="sky"
          />
          <StatCard
            label="Approx RAM"
            value={formatRam(data.memory.deviceMemory)}
            sub="Browser-reported device memory"
            icon={MemoryStick}
            accent="yellow"
          />
          <StatCard
            label="Battery"
            value={formatBattery(data.battery)}
            sub={formatBatterySub(data.battery)}
            icon={Battery}
            accent={
              data.battery.hasBattery
                ? data.battery.percent < 20
                  ? "red"
                  : data.battery.isCharging
                    ? "green"
                    : "yellow"
                : "sky"
            }
            bar={data.battery.hasBattery ? data.battery.percent : undefined}
          />
          <StatCard
            label="Connection"
            value={formatConnection(data.network)}
            sub={
              data.network.downlink
                ? `${data.network.downlink} Mbps downlink`
                : data.network.online
                  ? "Online"
                  : "Offline"
            }
            icon={Wifi}
            accent={data.network.online ? "green" : "red"}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <Layers size={14} /> Graphics & Display
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              GPU
            </div>
            <div className="text-lg font-bold text-white">
              {data.gpu?.vendor || "Not exposed"}
            </div>
            <div className="mt-1 break-words text-sm text-gray-400">
              {data.gpu?.renderer || "The browser did not expose a renderer string."}
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Display
            </div>
            <div className="text-lg font-bold text-white">
              {data.screen.width} x {data.screen.height}
            </div>
            <div className="mt-1 text-sm text-gray-400">
              Available area {data.screen.availWidth} x {data.screen.availHeight}
            </div>
            <div className="mt-3 text-sm text-gray-400">
              Pixel ratio {data.screen.pixelRatio} • {data.screen.colorDepth}-bit color
            </div>
          </div>
        </div>
      </section>

      {detailed && (
        <>
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <HardDrive size={14} /> Storage & Session
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label="Storage Quota"
                value={formatBytes(data.storage.quota)}
                sub="Estimated by the browser"
                icon={HardDrive}
                accent="sky"
              />
              <StatCard
                label="Storage Used"
                value={formatBytes(data.storage.usage)}
                sub="Origin storage, not full disk usage"
                icon={HardDrive}
                accent="purple"
              />
              <StatCard
                label="Architecture"
                value={data.cpu.architecture || "Not exposed"}
                sub={data.cpu.bitness ? `${data.cpu.bitness}-bit` : "Bitness unavailable"}
                icon={Cpu}
                accent="green"
              />
              <StatCard
                label="Time Zone"
                value={data.os.timeZone}
                sub={data.os.language}
                icon={Globe}
                accent="sky"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Monitor size={14} /> Browser Limits
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <StatCard
                label="CPU Model"
                value="Hidden"
                sub="Web pages cannot read the real CPU brand or clock speed."
                icon={Cpu}
                accent="sky"
              />
              <StatCard
                label="Live RAM Usage"
                value="Hidden"
                sub="Browsers do not expose used/free system memory."
                icon={MemoryStick}
                accent="yellow"
              />
              <StatCard
                label="Hostname / Disks"
                value="Hidden"
                sub="Browser security blocks hostnames, filesystems, and processes."
                icon={HardDrive}
                accent="purple"
              />
            </div>
          </section>
        </>
      )}
    </>
  );
}
