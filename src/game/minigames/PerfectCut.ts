import type { GhostEvent } from '../../types/ghost';
import type { GhostTimeline } from '../../types/ghost';

export interface PCCallbacks {
  onScore: (score: number) => void;
  onRecord: (data: Omit<GhostEvent, 't'>) => void;
  onEnd: () => void;
}

// Ghost trajectory segment — between consecutive hits
interface GhostSeg {
  tStart: number; // ms
  angle: number;  // rad at start of segment
  speed: number;  // rad/s
  dir: 1 | -1;
}

const INITIAL_SPEED = 1.8;   // rad/s
const INITIAL_ZONE  = Math.PI * 0.45; // ~81°
const MIN_ZONE      = Math.PI * 0.16; // ~29°
const MAX_SPEED     = 9.0;

export class PerfectCut {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private size = 0;
  private cx = 0;
  private cy = 0;
  private trackR = 0;
  private callbacks: PCCallbacks | null = null;

  // Game state
  private angle    = 0;
  private speed    = INITIAL_SPEED;
  private dir: 1 | -1 = 1;
  private zoneStart = Math.PI / 3;  // ~60° ahead of initial pointer
  private zoneSize  = INITIAL_ZONE;
  private hits      = 0;

  private rafId    = 0;
  private running  = false;
  private startTime = 0;
  private lastRaf   = 0;

  private hitFlash  = 0;  // countdown ms
  private missFlash = 0;

  // Ghost rendering
  private ghostSegs: GhostSeg[] = [];
  private ghostDone = false; // sender missed — ghost stopped

  getMode(): 'PERFECT_CUT' { return 'PERFECT_CUT'; }

  // ─── Public API ───────────────────────────────────────────────────────────

  mount(container: HTMLElement, callbacks: PCCallbacks): void {
    this.callbacks = callbacks;
    requestAnimationFrame(() => this.initCanvas(container));
  }

  loadGhost(timeline: GhostTimeline): void {
    this.ghostSegs = [{ tStart: 0, angle: 0, speed: INITIAL_SPEED, dir: 1 }];
    let dir: 1 | -1 = -1; // first hit reverses to -1
    for (const ev of timeline.events) {
      if (ev.action !== 'PC_HIT') continue;
      this.ghostSegs.push({
        tStart: ev.t,
        angle:  ev.angle  ?? 0,
        speed:  ev.speed  ?? INITIAL_SPEED,
        dir,
      });
      dir = (dir * -1) as 1 | -1;
    }
    // If sender had a miss event, mark ghost as stopped after last segment
    this.ghostDone = timeline.events.some(e => e.action === 'PC_MISS');
  }

  start(startTime: number): void {
    this.startTime = startTime;
    this.lastRaf   = startTime;
    this.running   = true;
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  // ─── Canvas setup ─────────────────────────────────────────────────────────

  private initCanvas(container: HTMLElement): void {
    const w    = container.offsetWidth  || 340;
    const h    = container.offsetHeight || 340;
    const size = Math.floor(Math.min(w, h));
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);

    this.size   = size;
    this.cx     = size / 2;
    this.cy     = size / 2;
    this.trackR = size * 0.37;

    const canvas = document.createElement('canvas');
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.cssText =
      `width:${size}px;height:${size}px;display:block;touch-action:none;user-select:none;`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    this.canvas = canvas;
    this.ctx    = ctx;

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.running) this.handleTap();
    }, { passive: false });
    canvas.addEventListener('mousedown', () => {
      if (this.running) this.handleTap();
    });

    container.innerHTML = '';
    container.appendChild(canvas);
    this.draw(0);
  }

  // ─── Game loop ────────────────────────────────────────────────────────────

  private loop(now: number): void {
    if (!this.running) return;
    const dt = Math.min((now - this.lastRaf) / 1000, 0.05);
    this.lastRaf = now;
    const elapsed = now - this.startTime;

    this.angle += this.dir * this.speed * dt;
    if (this.hitFlash  > 0) this.hitFlash  -= dt * 1000;
    if (this.missFlash > 0) this.missFlash -= dt * 1000;

    this.draw(elapsed);
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  // ─── Input ────────────────────────────────────────────────────────────────

  private handleTap(): void {
    const t      = Math.round(performance.now() - this.startTime);
    const angle  = this.angle;
    const inZone = this.inZone(angle, this.zoneStart, this.zoneSize);

    if (inZone) {
      this.hits++;
      this.dir   = (this.dir * -1) as 1 | -1;
      this.speed = Math.min(this.speed * 1.18, MAX_SPEED);
      this.zoneSize = Math.max(this.zoneSize * 0.87, MIN_ZONE);
      this.hitFlash = 220;
      this.callbacks?.onScore(this.hits);
      this.callbacks?.onRecord({ action: 'PC_HIT', x: 0, y: 0, angle, speed: this.speed, hits: this.hits });
    } else {
      this.running   = false;
      this.missFlash = 450;
      cancelAnimationFrame(this.rafId);
      this.callbacks?.onRecord({ action: 'PC_MISS', x: 0, y: 0, angle });
      this.draw(performance.now() - this.startTime);
      // Small delay so the miss flash is visible before onEnd fires
      setTimeout(() => this.callbacks?.onEnd(), 520);
    }
  }

  // ─── Hit-zone math ────────────────────────────────────────────────────────

  private inZone(a: number, start: number, size: number): boolean {
    const TAU = Math.PI * 2;
    const n   = ((a % TAU) + TAU) % TAU;
    const s   = ((start % TAU) + TAU) % TAU;
    const end = s + size;
    return end <= TAU ? (n >= s && n <= end) : (n >= s || n <= end - TAU);
  }

  // ─── Ghost angle at elapsed ms ────────────────────────────────────────────

  private ghostAngleAt(elapsed: number): number | null {
    if (this.ghostSegs.length === 0) return null;
    // If ghost sender missed, stop ghost after last segment's final position
    const last = this.ghostSegs[this.ghostSegs.length - 1]!;
    // Find the applicable segment
    let seg = this.ghostSegs[0]!;
    for (const s of this.ghostSegs) {
      if (s.tStart <= elapsed) seg = s;
      else break;
    }
    const cap = this.ghostDone && seg === last ? last.tStart + 1500 : Infinity;
    const t   = Math.min(elapsed, cap);
    return seg.angle + seg.dir * seg.speed * ((t - seg.tStart) / 1000);
  }

  // ─── Drawing ─────────────────────────────────────────────────────────────

  private draw(elapsed: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const { size, cx, cy, trackR } = this;

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, size, size);

    // Subtle tick marks on track
    ctx.strokeStyle = 'rgba(30,30,46,1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 36; i++) {
      const a  = (i / 36) * Math.PI * 2;
      const r0 = trackR - 5;
      const r1 = trackR + 5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.stroke();
    }

    // Track ring
    ctx.beginPath();
    ctx.arc(cx, cy, trackR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(40,40,60,1)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Target zone
    const hitOn  = this.hitFlash  > 0;
    const missOn = this.missFlash > 0;
    const zColor = hitOn ? '#4ade80' : missOn ? '#f87171' : '#22d3ee';
    const { zoneStart, zoneSize } = this;

    ctx.save();
    ctx.shadowColor = zColor;
    ctx.shadowBlur  = hitOn ? 22 : 10;
    // Fill sector
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, trackR + 12, zoneStart, zoneStart + zoneSize);
    ctx.closePath();
    ctx.fillStyle = hitOn ? 'rgba(74,222,128,0.25)' : missOn ? 'rgba(248,113,113,0.2)' : 'rgba(34,211,238,0.12)';
    ctx.fill();
    // Arc border
    ctx.beginPath();
    ctx.arc(cx, cy, trackR + 12, zoneStart, zoneStart + zoneSize);
    ctx.strokeStyle = zColor;
    ctx.lineWidth   = hitOn ? 4 : 2.5;
    ctx.stroke();
    ctx.restore();

    // Ghost pointer
    const ga = this.ghostAngleAt(elapsed);
    if (ga !== null) {
      const gx = cx + Math.cos(ga) * trackR;
      const gy = cy + Math.sin(ga) * trackR;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth   = 2;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur  = 12;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(gx, gy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(gx, gy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.fill();
      ctx.restore();
    }

    // Player pointer
    const px = cx + Math.cos(this.angle) * trackR;
    const py = cy + Math.sin(this.angle) * trackR;
    const pc = hitOn ? '#4ade80' : missOn ? '#f87171' : '#22d3ee';

    ctx.save();
    ctx.strokeStyle = pc;
    ctx.lineWidth   = 2.5;
    ctx.shadowColor = pc;
    ctx.shadowBlur  = hitOn ? 24 : 16;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px, py, hitOn ? 9 : 6, 0, Math.PI * 2);
    ctx.fillStyle = pc;
    ctx.fill();
    ctx.restore();

    // Center pivot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
  }
}
