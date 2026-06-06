import type { GhostEvent } from '../../types/ghost';

const CELL_COUNT = 16; // 4×4
const DURATION = 30_000;

export interface TapGridCallbacks {
  onScore: (score: number) => void;
  onRecord: (data: Omit<GhostEvent, 't'>) => void;
  onEnd?: () => void;
}

export class TapGrid {
  private cells: HTMLElement[] = [];
  private activeCell = -1;
  private hitCell = -1;
  private score = 0;
  private running = false;
  private gameStartTime = 0;
  private expireTimer: ReturnType<typeof setTimeout> | null = null;
  private nextTimer: ReturnType<typeof setTimeout> | null = null;
  private callbacks: TapGridCallbacks | null = null;

  mount(container: HTMLElement, callbacks: TapGridCallbacks): void {
    this.callbacks = callbacks;
    this.buildGrid(container);
  }

  start(gameStartTime: number): void {
    this.gameStartTime = gameStartTime;
    this.score = 0;
    this.running = true;
    this.activateNext();
  }

  stop(): void {
    this.running = false;
    this.clearTimers();
    this.clearActive();
  }

  getScore(): number {
    return this.score;
  }

  private buildGrid(container: HTMLElement): void {
    container.innerHTML = '';
    this.cells = [];

    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      width: 100%;
      aspect-ratio: 1 / 1;
    `;

    for (let i = 0; i < CELL_COUNT; i++) {
      const cell = document.createElement('div');
      cell.style.cssText = `
        position: relative;
        border-radius: 14px;
        background: #111118;
        border: 1.5px solid #1e1e2e;
        overflow: hidden;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        cursor: pointer;
        will-change: transform;
      `;

      const bar = document.createElement('div');
      bar.className = 'cell-progress';
      bar.style.cssText = `
        position: absolute;
        bottom: 0; left: 0;
        height: 3px; width: 100%;
        background: rgba(34, 211, 238, 0.9);
        transform-origin: left center;
        transform: scaleX(0);
      `;
      cell.appendChild(bar);

      cell.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const t = e.touches[0];
        this.handleTap(i, t.clientX, t.clientY);
      }, { passive: false });

      cell.addEventListener('mousedown', (e) => {
        this.handleTap(i, e.clientX, e.clientY);
      });

      grid.appendChild(cell);
      this.cells.push(cell);
    }

    container.appendChild(grid);
  }

  private handleTap(index: number, clientX: number, clientY: number): void {
    if (!this.running || this.activeCell < 0) return;
    const x = clientX / window.innerWidth;
    const y = clientY / window.innerHeight;
    if (index === this.activeCell) {
      this.registerHit(index, x, y);
    } else {
      this.registerMiss(index, x, y);
    }
  }

  private registerHit(index: number, x: number, y: number): void {
    this.clearTimers();
    this.activeCell = -1;
    this.hitCell = index;
    this.score++;
    this.callbacks?.onRecord({ action: 'TAP_HIT', x, y, cell: index });
    this.callbacks?.onScore(this.score);
    this.showHitFlash(index);
    this.nextTimer = setTimeout(() => {
      if (this.running) this.activateNext();
    }, 90);
  }

  private registerMiss(index: number, x: number, y: number): void {
    this.callbacks?.onRecord({ action: 'TAP_MISS', x, y, cell: index });
    this.showMissFlash(index);
  }

  private activateNext(): void {
    if (!this.running) return;

    // Reset previously hit cell before picking next
    if (this.hitCell >= 0) {
      this.resetCell(this.cells[this.hitCell]!);
      this.hitCell = -1;
    }

    const elapsed = performance.now() - this.gameStartTime;
    const windowMs = this.windowMs(elapsed);

    let next: number;
    do { next = Math.floor(Math.random() * CELL_COUNT); }
    while (next === this.activeCell);

    this.activeCell = next;
    this.showActive(next, windowMs);

    this.expireTimer = setTimeout(() => {
      this.showExpiredFlash(next);
      this.activeCell = -1;
      this.nextTimer = setTimeout(() => {
        if (this.running) this.activateNext();
      }, 140);
    }, windowMs);
  }

  private showActive(index: number, windowMs: number): void {
    const cell = this.cells[index];
    if (!cell) return;
    cell.style.background = 'rgba(34, 211, 238, 0.12)';
    cell.style.borderColor = '#22d3ee';
    cell.style.boxShadow = '0 0 18px rgba(34,211,238,0.45), inset 0 0 10px rgba(34,211,238,0.08)';

    const bar = cell.querySelector('.cell-progress') as HTMLElement;
    if (bar) {
      bar.style.transition = 'none';
      bar.style.transform = 'scaleX(1)';
      requestAnimationFrame(() => {
        bar.style.transition = `transform ${windowMs}ms linear`;
        bar.style.transform = 'scaleX(0)';
      });
    }
  }

  private showHitFlash(index: number): void {
    const cell = this.cells[index];
    if (!cell) return;
    cell.style.background = 'rgba(255,255,255,0.88)';
    cell.style.borderColor = '#ffffff';
    cell.style.boxShadow = '0 0 30px rgba(255,255,255,0.55)';
    const bar = cell.querySelector('.cell-progress') as HTMLElement;
    if (bar) { bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)'; }
  }

  private showMissFlash(index: number): void {
    const cell = this.cells[index];
    if (!cell || index === this.activeCell) return;
    const prev = { bg: cell.style.background, border: cell.style.borderColor, shadow: cell.style.boxShadow };
    cell.style.background = 'rgba(248,113,113,0.18)';
    cell.style.borderColor = 'rgba(248,113,113,0.5)';
    setTimeout(() => {
      if (!cell) return;
      cell.style.background = prev.bg;
      cell.style.borderColor = prev.border;
      cell.style.boxShadow = prev.shadow;
    }, 180);
  }

  private showExpiredFlash(index: number): void {
    const cell = this.cells[index];
    if (!cell) return;
    cell.style.background = 'rgba(248,113,113,0.1)';
    cell.style.borderColor = 'rgba(248,113,113,0.3)';
    cell.style.boxShadow = 'none';
    const bar = cell.querySelector('.cell-progress') as HTMLElement;
    if (bar) { bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)'; }
    setTimeout(() => this.resetCell(cell), 140);
  }

  private clearActive(): void {
    if (this.activeCell >= 0) {
      this.resetCell(this.cells[this.activeCell]!);
      this.activeCell = -1;
    }
    if (this.hitCell >= 0) {
      this.resetCell(this.cells[this.hitCell]!);
      this.hitCell = -1;
    }
  }

  private resetCell(cell: HTMLElement): void {
    cell.style.background = '#111118';
    cell.style.borderColor = '#1e1e2e';
    cell.style.boxShadow = 'none';
    const bar = cell.querySelector('.cell-progress') as HTMLElement;
    if (bar) { bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)'; }
  }

  private clearTimers(): void {
    if (this.expireTimer) { clearTimeout(this.expireTimer); this.expireTimer = null; }
    if (this.nextTimer) { clearTimeout(this.nextTimer); this.nextTimer = null; }
  }

  /** Cell window shrinks linearly: 1200ms → 600ms over 30s */
  private windowMs(elapsed: number): number {
    const t = Math.min(elapsed / DURATION, 1);
    return Math.round(1200 - t * 600);
  }
}
