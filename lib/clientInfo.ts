interface BatteryManagerLike {
  level: number;
  charging: boolean;
}

interface BrowserBrand {
  brand: string;
  version: string;
}

interface UserAgentHighEntropyValues {
  architecture?: string;
  bitness?: string;
  model?: string;
  platform?: string;
  platformVersion?: string;
  uaFullVersion?: string;
  fullVersionList?: BrowserBrand[];
}

interface UserAgentDataLike {
  brands?: BrowserBrand[];
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues?: (
    hints: string[]
  ) => Promise<UserAgentHighEntropyValues>;
}

interface NetworkInformationLike {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
  type?: string;
}

interface BrowserNavigator extends Navigator {
  connection?: NetworkInformationLike;
  deviceMemory?: number;
  getBattery?: () => Promise<BatteryManagerLike>;
  mozConnection?: NetworkInformationLike;
  userAgentData?: UserAgentDataLike;
  webkitConnection?: NetworkInformationLike;
}

export interface ClientSystemInfo {
  cpu: {
    architecture?: string;
    bitness?: string;
    cores: number;
  };
  memory: {
    deviceMemory?: number;
  };
  os: {
    browserName: string;
    browserVersion: string;
    language: string;
    osName: string;
    osVersion: string;
    platform: string;
    timeZone: string;
    userAgent: string;
  };
  battery: {
    hasBattery: boolean;
    percent: number;
    isCharging: boolean;
  };
  device: {
    isMobileLike: boolean;
    isTouchDevice: boolean;
    maxTouchPoints: number;
    model?: string;
  };
  gpu: {
    renderer: string;
    vendor: string;
  } | null;
  network: {
    downlink?: number;
    effectiveType?: string;
    online: boolean;
    rtt?: number;
    saveData?: boolean;
    type?: string;
  };
  screen: {
    availHeight: number;
    availWidth: number;
    colorDepth: number;
    height: number;
    pixelRatio: number;
    width: number;
  };
  storage: {
    quota?: number;
    usage?: number;
  };
}

function parseBrowserFromUserAgent(userAgent: string) {
  const browserMatchers = [
    { name: "Edge", pattern: /Edg\/([\d.]+)/ },
    { name: "Opera", pattern: /OPR\/([\d.]+)/ },
    { name: "Chrome", pattern: /Chrome\/([\d.]+)/ },
    { name: "Firefox", pattern: /Firefox\/([\d.]+)/ },
    { name: "Safari", pattern: /Version\/([\d.]+).*Safari/ },
  ];

  for (const matcher of browserMatchers) {
    const match = userAgent.match(matcher.pattern);
    if (match) {
      return { name: matcher.name, version: match[1] };
    }
  }

  return { name: "Unknown", version: "" };
}

function parseOsFromUserAgent(userAgent: string) {
  const windowsMatch = userAgent.match(/Windows NT ([\d.]+)/);
  if (windowsMatch) {
    const ntVersion = windowsMatch[1];
    const mappedVersion =
      ntVersion === "10.0"
        ? "10/11"
        : ntVersion === "6.3"
          ? "8.1"
          : ntVersion === "6.2"
            ? "8"
            : ntVersion === "6.1"
              ? "7"
              : ntVersion;
    return { name: "Windows", version: mappedVersion };
  }

  const macMatch = userAgent.match(/Mac OS X ([\d_]+)/);
  if (macMatch) {
    return { name: "macOS", version: macMatch[1].replace(/_/g, ".") };
  }

  const iosMatch = userAgent.match(/(?:iPhone|iPad).* OS ([\d_]+)/);
  if (iosMatch) {
    return { name: "iOS", version: iosMatch[1].replace(/_/g, ".") };
  }

  const androidMatch = userAgent.match(/Android ([\d.]+)/);
  if (androidMatch) {
    return { name: "Android", version: androidMatch[1] };
  }

  if (userAgent.includes("Linux")) {
    return { name: "Linux", version: "" };
  }

  return { name: "Unknown", version: "" };
}

function pickBrowserBrand(brands: BrowserBrand[] = []) {
  const preferredBrand =
    brands.find(
      (brand) =>
        !brand.brand.includes("Not") &&
        brand.brand !== "Chromium"
    ) ??
    brands.find((brand) => !brand.brand.includes("Not")) ??
    null;

  return preferredBrand
    ? { name: preferredBrand.brand, version: preferredBrand.version }
    : null;
}

async function getGpuInfo() {
  const canvas = document.createElement("canvas");
  const context =
    canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl");

  if (!context) {
    return null;
  }

  const gl = context as WebGLRenderingContext;
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

  if (debugInfo) {
    return {
      renderer:
        String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) || "Unknown",
      vendor:
        String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)) || "Unknown",
    };
  }

  return {
    renderer: String(gl.getParameter(gl.RENDERER)) || "Unknown",
    vendor: String(gl.getParameter(gl.VENDOR)) || "Unknown",
  };
}

export async function getClientInfo(): Promise<ClientSystemInfo> {
  const browserNavigator = navigator as BrowserNavigator;
  const userAgent = navigator.userAgent;
  const browserFallback = parseBrowserFromUserAgent(userAgent);
  const osFallback = parseOsFromUserAgent(userAgent);
  const userAgentData = browserNavigator.userAgentData;
  const connection =
    browserNavigator.connection ||
    browserNavigator.mozConnection ||
    browserNavigator.webkitConnection;

  let browserName = browserFallback.name;
  let browserVersion = browserFallback.version;
  let platform = userAgentData?.platform || navigator.platform || "Unknown";
  let osName = osFallback.name;
  let osVersion = osFallback.version;
  let architecture: string | undefined;
  let bitness: string | undefined;
  let model: string | undefined;

  const brandedBrowser = pickBrowserBrand(userAgentData?.brands);
  if (brandedBrowser) {
    browserName = brandedBrowser.name;
    browserVersion = brandedBrowser.version;
  }

  if (userAgentData?.getHighEntropyValues) {
    try {
      const highEntropy = await userAgentData.getHighEntropyValues([
        "architecture",
        "bitness",
        "model",
        "platform",
        "platformVersion",
        "uaFullVersion",
        "fullVersionList",
      ]);

      architecture = highEntropy.architecture;
      bitness = highEntropy.bitness;
      model = highEntropy.model || undefined;
      platform = highEntropy.platform || platform;

      if (highEntropy.platformVersion) {
        osVersion = highEntropy.platformVersion;
      }

      const highEntropyBrowser = pickBrowserBrand(highEntropy.fullVersionList);
      if (highEntropyBrowser) {
        browserName = highEntropyBrowser.name;
        browserVersion = highEntropyBrowser.version;
      } else if (highEntropy.uaFullVersion) {
        browserVersion = highEntropy.uaFullVersion;
      }
    } catch {
      // Ignore browsers that block high-entropy UA data.
    }
  }

  if (platform !== "Unknown" && osName === "Unknown") {
    osName = platform;
  }

  const info: ClientSystemInfo = {
    cpu: {
      architecture,
      bitness,
      cores: navigator.hardwareConcurrency || 0,
    },
    memory: {
      deviceMemory: browserNavigator.deviceMemory,
    },
    os: {
      browserName,
      browserVersion,
      language: navigator.language || "Unknown",
      osName,
      osVersion,
      platform,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
      userAgent,
    },
    battery: {
      hasBattery: false,
      percent: 0,
      isCharging: false,
    },
    device: {
      isMobileLike:
        Boolean(userAgentData?.mobile) ||
        /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent),
      isTouchDevice:
        "ontouchstart" in window || navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      model,
    },
    gpu: await getGpuInfo(),
    network: {
      downlink: connection?.downlink,
      effectiveType: connection?.effectiveType,
      online: navigator.onLine,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
      type: connection?.type,
    },
    screen: {
      availHeight: window.screen.availHeight,
      availWidth: window.screen.availWidth,
      colorDepth: window.screen.colorDepth,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1,
      width: window.screen.width,
    },
    storage: {},
  };

  if (browserNavigator.getBattery) {
    try {
      const battery = await browserNavigator.getBattery();
      info.battery = {
        hasBattery: true,
        percent: Math.round(battery.level * 100),
        isCharging: battery.charging,
      };
    } catch {
      // Ignore browsers that hide or block the Battery API.
    }
  }

  if (navigator.storage?.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      info.storage = {
        quota: estimate.quota,
        usage: estimate.usage,
      };
    } catch {
      // Ignore browsers that hide storage estimates.
    }
  }

  return info;
}
