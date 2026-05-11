"use client";

import { useEffect, useState } from "react";

export type AccessMode = "detecting" | "local" | "browser";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function getAccessModeForHostname(hostname: string): AccessMode {
  return LOOPBACK_HOSTS.has(hostname) ? "local" : "browser";
}

export function useAccessMode() {
  const [mode, setMode] = useState<AccessMode>("detecting");

  useEffect(() => {
    setMode(getAccessModeForHostname(window.location.hostname));
  }, []);

  return mode;
}
