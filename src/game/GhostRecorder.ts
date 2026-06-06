import type { GhostEvent } from '../types/ghost';

export class GhostRecorder {
  private events: GhostEvent[] = [];
  private startTime = 0;

  start(startTime?: number): void {
    this.events = [];
    this.startTime = startTime ?? performance.now();
    this.push({ action: 'GAME_START', x: 0, y: 0 });
  }

  push(data: Omit<GhostEvent, 't'>): void {
    const t = Math.round(performance.now() - this.startTime);
    this.events.push({ t, ...data } as GhostEvent);
  }

  stop(): GhostEvent[] {
    this.push({ action: 'GAME_END', x: 0, y: 0 });
    return [...this.events];
  }

  reset(): void {
    this.events = [];
    this.startTime = 0;
  }
}
