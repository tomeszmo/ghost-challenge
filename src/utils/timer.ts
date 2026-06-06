export function now(): number {
  return performance.now();
}

export function msToSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

export function formatCountdown(remainingMs: number): string {
  const s = Math.ceil(remainingMs / 1000);
  return s.toString();
}
