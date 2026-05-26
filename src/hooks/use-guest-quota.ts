import { useCallback, useEffect, useState } from "react";

/**
 * Guest quota (device-scoped, sliding 5h window).
 * Connected users have unlimited usage — this hook is only consulted when
 * there is no authenticated session.
 *
 * Limit per kind:
 *  - simple : 10  (chat sans recherche)
 *  - search : 7   (recherche web)
 *  - deep   : 5   (recherche approfondie)
 *
 * NOTE: enforcement is client-side only (localStorage). Easy to bypass by
 * clearing site data or using private mode. A robust block would require a
 * server endpoint indexed by device_id + IP.
 */

export type QuotaKind = "simple" | "search" | "deep";

const LIMITS: Record<QuotaKind, number> = {
  simple: 10,
  search: 7,
  deep: 5,
};

const WINDOW_MS = 5 * 60 * 60 * 1000; // 5h
const STORAGE_KEY = "fulania_guest_quota_v1";
const DEVICE_KEY = "fulania_device_id";

type Store = Record<QuotaKind, number[]>;

function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function load(): Store {
  if (typeof window === "undefined") return { simple: [], search: [], deep: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { simple: [], search: [], deep: [] };
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      simple: Array.isArray(parsed.simple) ? parsed.simple : [],
      search: Array.isArray(parsed.search) ? parsed.search : [],
      deep: Array.isArray(parsed.deep) ? parsed.deep : [],
    };
  } catch {
    return { simple: [], search: [], deep: [] };
  }
}

function save(store: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function prune(arr: number[], now: number): number[] {
  const cutoff = now - WINDOW_MS;
  return arr.filter((t) => t > cutoff);
}

export interface QuotaState {
  deviceId: string;
  remaining: Record<QuotaKind, number>;
  limits: Record<QuotaKind, number>;
  canUse: (kind: QuotaKind) => boolean;
  consume: (kind: QuotaKind) => boolean;
  nextResetIn: (kind: QuotaKind) => number; // ms until oldest entry expires
  formatReset: (kind: QuotaKind) => string; // "5h 00min"
}

export function useGuestQuota(enabled: boolean): QuotaState {
  const [tick, setTick] = useState(0);

  // Re-render every minute so countdowns refresh.
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [enabled]);

  const deviceId = enabled ? getDeviceId() : "authenticated";

  const compute = useCallback(() => {
    const now = Date.now();
    const store = load();
    const pruned: Store = {
      simple: prune(store.simple, now),
      search: prune(store.search, now),
      deep: prune(store.deep, now),
    };
    return { now, pruned };
  }, []);

  const { pruned } = compute();
  // touch tick so re-renders pick up changes
  void tick;

  const remaining: Record<QuotaKind, number> = {
    simple: Math.max(0, LIMITS.simple - pruned.simple.length),
    search: Math.max(0, LIMITS.search - pruned.search.length),
    deep: Math.max(0, LIMITS.deep - pruned.deep.length),
  };

  const canUse = useCallback(
    (kind: QuotaKind) => {
      if (!enabled) return true;
      const { pruned } = compute();
      return pruned[kind].length < LIMITS[kind];
    },
    [enabled, compute],
  );

  const consume = useCallback(
    (kind: QuotaKind) => {
      if (!enabled) return true;
      const { now, pruned } = compute();
      if (pruned[kind].length >= LIMITS[kind]) return false;
      pruned[kind] = [...pruned[kind], now];
      save(pruned);
      setTick((t) => t + 1);
      return true;
    },
    [enabled, compute],
  );

  const nextResetIn = useCallback(
    (kind: QuotaKind) => {
      const { now, pruned } = compute();
      const oldest = pruned[kind][0];
      if (oldest === undefined) return 0;
      return Math.max(0, oldest + WINDOW_MS - now);
    },
    [compute],
  );

  const formatReset = useCallback(
    (kind: QuotaKind) => {
      const ms = nextResetIn(kind);
      if (ms <= 0) return "maintenant";
      const totalMin = Math.ceil(ms / 60_000);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      if (h <= 0) return `${m} min`;
      return `${h}h ${m.toString().padStart(2, "0")}min`;
    },
    [nextResetIn],
  );

  return { deviceId, remaining, limits: LIMITS, canUse, consume, nextResetIn, formatReset };
}
