"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  if (typeof window === "undefined") return true;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return true;
}

/**
 * Tracks whether the device can hover (mouse/trackpad), live. Touch-only
 * devices report `false`.
 */
export function useCanHover(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
