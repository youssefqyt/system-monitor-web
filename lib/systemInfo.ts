import si from "systeminformation";
import type { SystemOverview } from "@/lib/systemTypes";

export async function getSystemOverview(): Promise<SystemOverview> {
  try {
    const [cpu, mem, osInfo, battery, graphics] = (await Promise.all([
      si.cpu().catch(() => ({})),
      si.mem().catch(() => ({})),
      si.osInfo().catch(() => ({})),
      si.battery().catch(() => ({})),
      si.graphics().catch(() => ({ controllers: [] })),
    ])) as any[];

    let currentLoad: any = { currentLoad: 0 };
    try {
      currentLoad = await si.currentLoad();
    } catch (e) {
      console.error("Error fetching current load:", e);
    }

    return {
      cpu: {
        manufacturer: cpu.manufacturer || "N/A",
        brand: cpu.brand || "N/A",
        speed: cpu.speed || 0,
        cores: cpu.cores || 0,
        physicalCores: cpu.physicalCores || 0,
        load: Math.round(currentLoad.currentLoad || 0),
      },
      memory: {
        total: mem.total || 0,
        used: mem.used || 0,
        free: mem.free || 0,
        usedPercent: mem.total ? Math.round((mem.used / mem.total) * 100) : 0,
      },
      os: {
        platform: osInfo.platform || "N/A",
        distro: osInfo.distro || "N/A",
        release: osInfo.release || "N/A",
        arch: osInfo.arch || "N/A",
        hostname: osInfo.hostname || "N/A",
        kernel: osInfo.kernel || "N/A",
      },
      battery: {
        hasBattery: battery.hasBattery || false,
        percent: battery.percent || 0,
        isCharging: battery.isCharging || false,
      },
      gpu: (graphics.controllers || []).map((g: any) => ({
        vendor: g.vendor || "N/A",
        model: g.model || "N/A",
        vram: g.vram || 0,
      })),
      isVercel: !!process.env.VERCEL,
    };
  } catch (error) {
    console.error("Error in getSystemOverview:", error);
    throw error;
  }
}

export async function getPortsAndServices() {
  try {
    const connections = (await si.networkConnections().catch(() => [])) as any[];
    const listening = connections.filter(
      (c) => c.state === "LISTEN" || c.state === "LISTENING"
    );
    return {
      list: listening.map((c) => ({
        localAddress: c.localAddress,
        localPort: c.localPort,
        protocol: c.protocol,
        pid: c.pid,
        state: c.state,
      })),
      isVercel: !!process.env.VERCEL,
    };
  } catch (error) {
    console.error("Error in getPortsAndServices:", error);
    return {
      list: [],
      isVercel: !!process.env.VERCEL,
    };
  }
}

export async function getProcesses() {
  try {
    const procs = (await si
      .processes()
      .catch(() => ({ all: 0, running: 0, sleeping: 0, list: [] }))) as any;
    return {
      all: procs.all || 0,
      running: procs.running || 0,
      sleeping: procs.sleeping || 0,
      list: (procs.list || [])
        .sort((a: any, b: any) => b.cpu - a.cpu)
        .slice(0, 50)
        .map((p: any) => ({
          pid: p.pid,
          name: p.name,
          cpu: Math.round(p.cpu * 100) / 100,
          mem: Math.round(p.mem * 100) / 100,
          memVsz: p.memVsz,
          memRss: p.memRss,
          started: p.started,
          state: p.state,
          user: p.user,
          command: p.command,
        })),
      isVercel: !!process.env.VERCEL,
    };
  } catch (error) {
    console.error("Error in getProcesses:", error);
    return {
      all: 0,
      running: 0,
      sleeping: 0,
      list: [],
      isVercel: !!process.env.VERCEL,
    };
  }
}

export async function getDiskInfo() {
  try {
    const [disks, fsSize, diskIO] = (await Promise.all([
      si.diskLayout().catch(() => []),
      si.fsSize().catch(() => []),
      si.disksIO().catch(() => ({})),
    ])) as any[];

    return {
      physical: (disks || []).map((d: any) => ({
        name: d.name,
        type: d.type,
        vendor: d.vendor,
        size: d.size,
        interfaceType: d.interfaceType,
      })),
      filesystems: (fsSize || []).map((f: any) => ({
        fs: f.fs,
        type: f.type,
        size: f.size,
        used: f.used,
        available: f.available,
        usePercent: f.use,
        mount: f.mount,
      })),
      io: {
        rIO: diskIO?.rIO ?? 0,
        wIO: diskIO?.wIO ?? 0,
        rIO_sec: diskIO?.rIO_sec ?? 0,
        wIO_sec: diskIO?.wIO_sec ?? 0,
      },
      isVercel: !!process.env.VERCEL,
    };
  } catch (error) {
    console.error("Error in getDiskInfo:", error);
    return {
      physical: [],
      filesystems: [],
      io: { rIO: 0, wIO: 0, rIO_sec: 0, wIO_sec: 0 },
      isVercel: !!process.env.VERCEL,
    };
  }
}

export async function getNetworkInfo() {
  try {
    const [interfaces, stats, defaultNet] = (await Promise.all([
      si.networkInterfaces().catch(() => []),
      si.networkStats().catch(() => []),
      si.networkInterfaceDefault().catch(() => ""),
    ])) as any[];

    const ifaceArray = Array.isArray(interfaces) ? interfaces : [interfaces];

    return {
      default: defaultNet,
      interfaces: (ifaceArray || []).map((i: any) => ({
        iface: i.iface,
        ip4: i.ip4,
        ip6: i.ip6,
        mac: i.mac,
        type: i.type,
        speed: i.speed,
        operstate: i.operstate,
        internal: i.internal,
        virtual: i.virtual,
      })),
      stats: (stats || []).map((s: any) => ({
        iface: s.iface,
        rx_bytes: s.rx_bytes,
        tx_bytes: s.tx_bytes,
        rx_sec: s.rx_sec,
        tx_sec: s.tx_sec,
      })),
      isVercel: !!process.env.VERCEL,
    };
  } catch (error) {
    console.error("Error in getNetworkInfo:", error);
    return {
      default: "",
      interfaces: [],
      stats: [],
      isVercel: !!process.env.VERCEL,
    };
  }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
