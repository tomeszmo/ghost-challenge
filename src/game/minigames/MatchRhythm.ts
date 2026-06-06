import type { GhostEvent } from '../../types/ghost';
import type { GhostTimeline } from '../../types/ghost';

export interface MRCallbacks {
  onScore: (score: number) => void;
  onRecord: (data: Omit<GhostEvent, 't'>) => void;
  onEnd?: () => void;
}

type Rating = 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';

const SCORE: Record<Rating, number> = { PERFECT: 300, GREAT: 200, GOOD: 100, MISS: 0 };
const THRESHOLDS = [0.045, 0.12, 0.25] as const; // PERFECT / GREAT / GOOD cutoffs (fraction of targetR)

const RATING_COLOR: Record<Rating, string> = {
  PERFECT: '#22d3ee',
  GREAT:   '#4ade80',
  GOOD:    '#facc15',
  MISS:    '#f87171',
};

// [spawnTime_ms, duration_ms] — pairs marked (*) are doubles
const SCHEDULE: [number, number][] = [
  [700,  1800],
  [2700, 1800],
  [4500, 1700],
  [6200, 1650],
  [7800, 1600],
  [8700, 1600], [8700, 1840],  // double
  [10300, 1520],
  [11800, 1500],
  [13100, 1450],
  [13100, 1620], // double
  [14500, 1400],
  [15800, 1380],
  [15800, 1520], // double
  [17200, 1320],
  [18400, 1280],
  [19600, 1250],
  [19600, 1400], // double
  [21000, 1200],
  [22200, 1180],
  [23400, 1150],
  [23400, 1300], // double
];

interface Ring {
  id: number;
  spawnT:   number;
  duration: number;
  scored:   boolean;
  opacity:  number;
}

interface RatingFlash {
  text:    Rating;
  color:   string;
  alpha:   number; // 1 → 0
  elapsed: number;
}

interface GhostRipple {
  rating:  Rating;
  alpha:   number;
  radius:  number;
  maxR:    number;
}

export class MatchRhythm {
  private canvas: HTMLCanvasElement | null = null;
  private ctx:    CanvasRenderingContext2D | null = null;
  private size   = 0;
  private cx     = 0;
  private cy     = 0;
  private targetR = 0;  // center circle radius
  private maxR    = 0;  // ring spawn radius

  private callbacks: MRCallbacks | null = null;

  private rings:     Ring[] = [];
  private nextId      = 0;
  private schedIdx    = 0;
  private totalScore  = 0;
  private running     = false;
  private rafId       = 0;
  private startTime   = 0;
  private lastRaf     = 0;

  private ratingFlash: RatingFlash | null = null;
  private ghostEvents: GhostEvent[] = [];
  private ghostRipples: GhostRipple[] = [];
  private ghostEventIdx = 0; // next ghost event to check

  getMode(): 'MATCH_RHYTHM' { return 'MATCH_RHYTHM'; }

  // ─── Public API ───────────────────────────────────────────────────────────

  mount(container: HTMLElement, callbacks: MRCallbacks): void {
    this.callbacks = callbacks;
    requestAnimationFrame(() => this.initCanvas(container));
  }

  loadGhost(timeline: GhostTimeline): void {
    this.ghostEvents = timeline.events.filter(e => e.action === 'MR_TAP');
    this.ghostEventIdx = 0;
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

    this.size    = size;
    this.cx      = size / 2;
    this.cy      = size / 2;
    this.targetR = size * 0.095;
    this.maxR    = size * 0.47;

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
    this.draw(0, 0);
  }

  // ─── Game loop ────────────────────────────────────────────────────────────

  private loop(now: number): void {
    if (!this.running) return;
    const dt      = Math.min((now - this.lastRaf) / 1000, 0.05);
    this.lastRaf  = now;
    const elapsed = now - this.startTime;

    this.spawnRings(elapsed);
    this.updateRings(elapsed, dt);
    this.updateGhostRipples(dt);
    this.checkGhostEvents(elapsed);
    this.draw(elapsed, dt);

    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  // ─── Ring lifecycle ───────────────────────────────────────────────────────

  private spawnRings(elapsed: number): void {
    while (
      this.schedIdx < SCHEDULE.length &&
      SCHEDULE[this.schedIdx]![0] <= elapsed
    ) {
      const [spawnT, duration] = SCHEDULE[this.schedIdx]!;
      this.rings.push({ id: this.nextId++, spawnT, duration, scored: false, opacity: 1 });
      this.schedIdx++;
    }
  }

  private updateRings(elapsed: number, dt: number): void {
    for (const r of this.rings) {
      if (r.scored) r.opacity = Math.max(0, r.opacity - dt * 4);
    }
    // Remove fully faded rings and rings that passed the center (missed)
    this.rings = this.rings.filter(r => {
      if (r.opacity <= 0) return false;
      const progress = (elapsed - r.spawnT) / r.duration;
      if (!r.scored && progress > 1.18) {
        r.scored = true; // missed — auto-fade
      }
      return true;
    });
  }

  private ringRadius(r: Ring, elapsed: number): number {
    const progress = Math.min((elapsed - r.spawnT) / r.duration, 1.5);
    // Ease-in: slow start, faster approach
    return this.maxR + (this.targetR - this.maxR) * progress;
  }

  // ─── Input ────────────────────────────────────────────────────────────────

  private handleTap(): void {
    const t       = Math.round(performance.now() - this.startTime);
    const elapsed = performance.now() - this.startTime;

    // Find the closest unsecored ring to the target
    let bestRing: Ring | null = null;
    let bestDelta = Infinity;

    for (const r of this.rings) {
      if (r.scored) continue;
      const radius = this.ringRadius(r, elapsed);
      const delta  = Math.abs(radius - this.targetR) / this.targetR;
      if (delta < bestDelta) { bestDelta = delta; bestRing = r; }
    }

    const rating = this.deltaToRating(bestDelta);
    const points = SCORE[rating];
    this.totalScore += points;

    if (bestRing) { bestRing.scored = true; }

    this.ratingFlash = { text: rating, color: RATING_COLOR[rating], alpha: 1, elapsed: 0 };
    this.callbacks?.onScore(this.totalScore);
    this.callbacks?.onRecord({ action: 'MR_TAP', x: 0, y: 0, delta: bestDelta, rating });
  }

  private deltaToRating(delta: number): Rating {
    if (delta < THRESHOLDS[0]) return 'PERFECT';
    if (delta < THRESHOLDS[1]) return 'GREAT';
    if (delta < THRESHOLDS[2]) return 'GOOD';
    return 'MISS';
  }

  // ─── Ghost events ─────────────────────────────────────────────────────────

  private checkGhostEvents(elapsed: number): void {
    while (
      this.ghostEventIdx < this.ghostEvents.length &&
      this.ghostEvents[this.ghostEventIdx]!.t <= elapsed
    ) {
      const ev = this.ghostEvents[this.ghostEventIdx]!;
      const rating = (ev.rating ?? 'MISS') as Rating;
      this.ghostRipples.push({
        rating,
        alpha: 0.75,
        radius: this.targetR,
        maxR: this.targetR * 3.5,
      });
      this.ghostEventIdx++;
    }
  }

  private updateGhostRipples(dt: number): void {
    for (const r of this.ghostRipples) {
      r.radius += dt * (r.maxR - this.targetR) * 1.5;
      r.alpha   = Math.max(0, r.alpha - dt * 1.1);
    }
    this.ghostRipples = this.ghostRipples.filter(r => r.alpha > 0);
  }

  // ─── Drawing ─────────────────────────────────────────────────────────────

  private draw(elapsed: number, dt: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const { size, cx, cy, targetR } = this;

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, size, size);

    // Ghost ripples
    for (const rip of this.ghostRipples) {
      const color = RATING_COLOR[rip.rating];
      ctx.save();
      ctx.globalAlpha = rip.alpha * 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 10;
      ctx.stroke();
      // Ghost rating label inside the ripple origin
      if (rip.radius < targetR * 1.8) {
        ctx.globalAlpha = rip.alpha;
        ctx.fillStyle   = color;
        ctx.font        = `600 ${Math.round(targetR * 0.75)}px system-ui`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`👻 ${rip.rating}`, cx, cy - targetR * 1.6);
      }
      ctx.restore();
    }

    // Incoming rings
    for (const r of this.rings) {
      const radius = this.ringRadius(r, elapsed);
      if (radius < 0) continue;
      ctx.save();
      ctx.globalAlpha = r.opacity;
      const progress  = 1 - Math.min((elapsed - r.spawnT) / r.duration, 1);
      const brightness = 0.45 + progress * 0.55;
      ctx.strokeStyle = `rgba(34,211,238,${brightness})`;
      ctx.lineWidth   = r.scored ? 1.5 : 2.5;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur  = r.scored ? 4 : 14;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(radius, 1), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Target ring (the "aim here" guide)
    ctx.save();
    ctx.strokeStyle = 'rgba(34,211,238,0.22)';
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, targetR * 1.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Center target circle
    ctx.save();
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur  = 20;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, targetR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(34,211,238,0.1)';
    ctx.fill();
    ctx.restore();

    // Rating flash
    if (this.ratingFlash) {
      const rf = this.ratingFlash;
      rf.elapsed += dt * 1000;
      rf.alpha    = Math.max(0, 1 - rf.elapsed / 600);
      if (rf.alpha <= 0) {
        this.ratingFlash = null;
      } else {
        ctx.save();
        ctx.globalAlpha = rf.alpha;
        ctx.fillStyle   = rf.color;
        ctx.shadowColor = rf.color;
        ctx.shadowBlur  = 20;
        ctx.font        = `800 ${Math.round(size * 0.1)}px system-ui`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rf.text, cx, cy - targetR * 2.8);
        ctx.restore();
      }
    }
  }
}
