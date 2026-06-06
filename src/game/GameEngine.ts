type TickFn = (elapsed: number, remaining: number) => void;
type EndFn = () => void;

export class GameEngine {
  private rafId = 0;
  private running = false;
  private endCb: EndFn | null = null;

  start(duration: number, onTick: TickFn, onEnd: EndFn): void {
    this.running = true;
    this.endCb = onEnd;
    const startTime = performance.now();

    const tick = (now: number) => {
      if (!this.running) return;
      const elapsed = now - startTime;
      const remaining = Math.max(0, duration - elapsed);
      onTick(elapsed, remaining);
      if (remaining <= 0) {
        this.running = false;
        onEnd();
        return;
      }
      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  /** Call from a minigame to end early (e.g. PerfectCut miss). */
  forceEnd(): void {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.endCb?.();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  isRunning(): boolean {
    return this.running;
  }
}
