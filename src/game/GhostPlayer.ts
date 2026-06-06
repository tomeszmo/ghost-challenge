import type { GhostEvent } from '../types/ghost';

export class GhostPlayer {
  private events: GhostEvent[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  private overlay: HTMLElement | null = null;
  private gridEl: HTMLElement | null = null;

  load(events: GhostEvent[]): void {
    this.events = events;
  }

  /**
   * screenRoot — full-screen element the overlay is painted on.
   * gridEl    — the grid container used to derive precise cell-centre coordinates.
   */
  start(screenRoot: HTMLElement, gridEl?: HTMLElement): void {
    this.gridEl = gridEl ?? null;

    this.overlay = document.createElement('div');
    this.overlay.style.cssText =
      'position:absolute;inset:0;pointer-events:none;z-index:6;overflow:hidden;';
    screenRoot.appendChild(this.overlay);

    this.events.forEach((evt) => {
      if (evt.action !== 'TAP_HIT') return;

      const timer = setTimeout(() => {
        const pos = this.resolvePosition(evt);
        if (pos) this.flashTap(pos.x, pos.y);
      }, evt.t);

      this.timers.push(timer);
    });
  }

  stop(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.overlay?.remove();
    this.overlay = null;
    this.gridEl = null;
  }

  // ─── Position resolution ──────────────────────────────────────────────────

  /** Prefer DOM-derived cell centres (exact); fall back to recorded x/y (device-relative). */
  private resolvePosition(evt: GhostEvent): { x: number; y: number } | null {
    if (evt.cell !== undefined && this.gridEl) {
      return this.cellCenter(evt.cell);
    }
    if (evt.x || evt.y) {
      return { x: evt.x * window.innerWidth, y: evt.y * window.innerHeight };
    }
    return null;
  }

  private cellCenter(cellIndex: number): { x: number; y: number } | null {
    if (!this.gridEl) return null;
    const grid = this.gridEl.firstElementChild as HTMLElement | null;
    if (!grid) return null;

    const rect = grid.getBoundingClientRect();
    const col = cellIndex % 4;
    const row = Math.floor(cellIndex / 4);
    const cw = rect.width  / 4;
    const ch = rect.height / 4;
    return {
      x: rect.left + (col + 0.5) * cw,
      y: rect.top  + (row + 0.5) * ch,
    };
  }

  // ─── Visual ───────────────────────────────────────────────────────────────

  private flashTap(x: number, y: number): void {
    if (!this.overlay) return;

    const ring = document.createElement('div');
    ring.style.cssText = `
      position:absolute;
      width:64px; height:64px;
      left:${x - 32}px; top:${y - 32}px;
      border-radius:50%;
      border:2px solid rgba(168,85,247,0.9);
      box-shadow:0 0 20px rgba(168,85,247,0.55), inset 0 0 10px rgba(168,85,247,0.15);
      background:rgba(168,85,247,0.18);
      transform:scale(0.15); opacity:0;
      pointer-events:none;
    `;

    const dot = document.createElement('div');
    dot.style.cssText = `
      position:absolute;
      width:16px; height:16px;
      left:${x - 8}px; top:${y - 8}px;
      border-radius:50%;
      background:rgba(168,85,247,0.95);
      box-shadow:0 0 12px rgba(168,85,247,0.9);
      transform:scale(0); opacity:0;
      pointer-events:none;
    `;

    this.overlay.appendChild(ring);
    this.overlay.appendChild(dot);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      ring.style.transition = 'transform 0.18s cubic-bezier(0.16,1,0.3,1), opacity 0.12s ease';
      ring.style.transform = 'scale(1)';
      ring.style.opacity = '1';

      dot.style.transition = 'transform 0.15s cubic-bezier(0.16,1,0.3,1), opacity 0.12s ease';
      dot.style.transform = 'scale(1)';
      dot.style.opacity = '1';

      setTimeout(() => {
        ring.style.transition = 'transform 0.28s ease, opacity 0.28s ease';
        ring.style.transform = 'scale(1.65)';
        ring.style.opacity = '0';

        dot.style.transition = 'opacity 0.2s ease';
        dot.style.opacity = '0';

        setTimeout(() => { ring.remove(); dot.remove(); }, 300);
      }, 150);
    }));
  }
}
