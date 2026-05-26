import { useCallback, useEffect, useState } from "react";

/**
 * Guest quota (device-scoped, sliding 5h window).
 * UNIFIED bucket: every action (simple / search / deep) consumes the same
 * shared pool. When the pool is empty, all actions are blocked.
 *
 * The user never sees a counter — only the "Connectez-vous pour continuer"
 * message when the pool is depleted.
 *
 * NOTE: enforcement is client-side only (localStorage). Easy to bypass by
 * clearing site data or using private mode. A robust block would require a
 * server endpoint indexed by device_id + IP.
 */

export type QuotaKind = "simple" | "search" | "deep";

const TOTAL_LIMIT = 10;
const WINDOW_MS = 5 * 60 * 60 * 1000; // 5h
const STORAGE_KEY = "fulania_guest_quota_v2";
const DEVICE_KEY = "fulania_device_id";

function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function loadTimestamps(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

function save(arr: number[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function prune(arr: number[], now: number): number[] {
  const cutoff = now - WINDOW_MS;
  return arr.filter((t) => t > cutoff);
}

export interface QuotaState {
  deviceId: string;
  canUse: (kind?: QuotaKind) => boolean;
  consume: (kind?: QuotaKind) => boolean;
  formatReset: () => string;
}

export function useGuestQuota(enabled: boolean): QuotaState {
  const [, setTick] = useState(0);

  // Re-render every minute so countdowns refresh.
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [enabled]);

  const deviceId = enabled ? getDeviceId() : "authenticated";

  const compute = useCallback(() => {
    const now = Date.now();
    return { now, pruned: prune(loadTimestamps(), now) };
  }, []);

  const canUse = useCallback(() => {
    if (!enabled) return true;
    const { pruned } = compute();
    return pruned.length < TOTAL_LIMIT;
  }, [enabled, compute]);

  const consume = useCallback(() => {
    if (!enabled) return true;
    const { now, pruned } = compute();
    if (pruned.length >= TOTAL_LIMIT) return false;
    const next = [...pruned, now];
    save(next);
    setTick((t) => t + 1);
    return true;
  }, [enabled, compute]);

  const formatReset = useCallback(() => {
    const { now, pruned } = compute();
    const oldest = pruned[0];
    if (oldest === undefined) return "maintenant";
    const ms = Math.max(0, oldest + WINDOW_MS - now);
    if (ms <= 0) return "maintenant";
    const totalMin = Math.ceil(ms / 60_000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h <= 0) return `${m} min`;
    return `${h}h ${m.toString().padStart(2, "0")}min`;
  }, [compute]);

  return { deviceId, canUse, consume, formatReset };
}
