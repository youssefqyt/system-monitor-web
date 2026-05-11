import si from "systeminformation";

export async function getSystemOverview() {
  const [cpu, mem, osInfo, battery, graphics] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.battery(),
    si.graphics(),
  ]);

  const currentLoad = await si.currentLoad();

  return {
    cpu: {
      manufacturer: cpu.manufacturer,
      brand: cpu.brand,
      speed: cpu.speed,
      cores: cpu.cores,
      physicalCores: cpu.physicalCores,
      load: Math.round(currentLoad.currentLoad),
    },
    memory: {
      total: mem.total,
      used: mem.used,
      free: mem.free,
      usedPercent: Math.round((mem.used / mem.total) * 100),
    },
    os: {
      platform: osInfo.platform,
      distro: osInfo.distro,
      release: osInfo.release,
      arch: osInfo.arch,
      hostname: osInfo.hostname,
      kernel: osInfo.kernel,
    },
    battery: {
      hasBattery: battery.hasBattery,
      percent: battery.percent,
      isCharging: battery.isCharging,
    },
    gpu: graphics.controllers.map((g) => ({
      vendor: g.vendor,
      model: g.model,
      vram: g.vram,
    })),
  };
}

export async function getPortsAndServices() {
  const connections = await si.networkConnections();
  const listening = connections.filter(
    (c) => c.state === "LISTEN" || c.state === "LISTENING"
  );
  return listening.map((c) => ({
    localAddress: c.localAddress,
    localPort: c.localPort,
    protocol: c.protocol,
    pid: c.pid,
    state: c.state,
  }));
}

export async function getProcesses() {
  const procs = await si.processes();
  return {
    all: procs.all,
    running: procs.running,
    sleeping: procs.sleeping,
    list: procs.list
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 50)
      .map((p) => ({
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
  };
}

export async function getDiskInfo() {
  const [disks, fsSize, diskIO] = await Promise.all([
    si.diskLayout(),
    si.fsSize(),
    si.disksIO(),
  ]);

  return {
    physical: disks.map((d) => ({
      name: d.name,
      type: d.type,
      vendor: d.vendor,
      size: d.size,
      interfaceType: d.interfaceType,
    })),
    filesystems: fsSize.map((f) => ({
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
  };
}

export async function getNetworkInfo() {
  const [interfaces, stats, defaultNet] = await Promise.all([
    si.networkInterfaces(),
    si.networkStats(),
    si.networkInterfaceDefault(),
  ]);

  const ifaceArray = Array.isArray(interfaces) ? interfaces : [interfaces];

  return {
    default: defaultNet,
    interfaces: ifaceArray.map((i) => ({
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
    stats: stats.map((s) => ({
      iface: s.iface,
      rx_bytes: s.rx_bytes,
      tx_bytes: s.tx_bytes,
      rx_sec: s.rx_sec,
      tx_sec: s.tx_sec,
    })),
  };
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
