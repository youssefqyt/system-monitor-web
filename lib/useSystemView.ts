"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccessMode } from "@/lib/accessMode";
import { getClientInfo, type ClientSystemInfo } from "@/lib/clientInfo";
import type { SystemOverview } from "@/lib/systemTypes";

interface UseSystemViewOptions {
  refreshInterval?: number;
}

async function fetchSystemOverview() {
  const response = await fetch("/api/system", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch system overview");
  }

  return (await response.json()) as SystemOverview;
}

export function useSystemView(options: UseSystemViewOptions = {}) {
  const { refreshInterval } = options;
  const accessMode = useAccessMode();
  const [systemData, setSystemData] = useState<SystemOverview | null>(null);
  const [clientData, setClientData] = useState<ClientSystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (accessMode === "detecting") {
      return;
    }

    setLoading(true);
    setError(null);

    if (accessMode === "browser") {
      try {
        setClientData(await getClientInfo());
        setSystemData(null);
      } catch {
        setClientData(null);
        setError("Could not read device information from this browser.");
      } finally {
        setLoading(false);
      }

      return;
    }

    const [systemResult, clientResult] = await Promise.allSettled([
      fetchSystemOverview(),
      getClientInfo(),
    ]);

    const nextSystem =
      systemResult.status === "fulfilled" ? systemResult.value : null;
    const nextClient =
      clientResult.status === "fulfilled" ? clientResult.value : null;

    setSystemData(nextSystem);
    setClientData(nextClient);

    if (!nextSystem && nextClient) {
      setError(
        "Local machine metrics are unavailable, so this page is showing browser-level device information instead."
      );
    } else if (!nextSystem && !nextClient) {
      setError("Could not load system information.");
    }

    setLoading(false);
  }, [accessMode]);

  useEffect(() => {
    if (accessMode === "detecting") {
      return;
    }

    load();
  }, [accessMode, load]);

  useEffect(() => {
    if (!refreshInterval || accessMode !== "local") {
      return;
    }

    const interval = window.setInterval(load, refreshInterval);
    return () => window.clearInterval(interval);
  }, [accessMode, load, refreshInterval]);

  const viewMode =
    accessMode === "local" && systemData ? "system" : clientData ? "browser" : "system";

  return {
    accessMode,
    clientData,
    error,
    isBrowserFallback: accessMode === "local" && !systemData && !!clientData,
    isHostedBrowserMode: accessMode === "browser",
    load,
    loading,
    systemData,
    viewMode,
  };
}
