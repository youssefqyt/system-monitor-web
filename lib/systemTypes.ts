export interface SystemOverview {
  cpu: {
    manufacturer: string;
    brand: string;
    speed: number;
    cores: number;
    physicalCores: number;
    load: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usedPercent: number;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
    hostname: string;
    kernel: string;
  };
  battery: {
    hasBattery: boolean;
    percent: number;
    isCharging: boolean;
  };
  gpu: Array<{
    vendor: string;
    model: string;
    vram: number;
  }>;
  isVercel: boolean;
}
