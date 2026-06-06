import type { Screen } from '../app';
import { GameEngine } from '../game/GameEngine';
import { GhostRecorder } from '../game/GhostRecorder';
import { TapGrid } from '../game/minigames/TapGrid';
import { PerfectCut } from '../game/minigames/PerfectCut';
import { MatchRhythm } from '../game/minigames/MatchRhythm';
import { sessionService } from '../services/SessionService';
import { router } from '../utils/router';
import type { GhostTimeline } from '../types/ghost';
import type { GameMode } from '../types/game';
import { GAME_DURATION } from '../types/game';

export class GameScreen implements Screen {
  private engine   = new GameEngine();
  private recorder = new GhostRecorder();
  private container: HTMLElement | null = null;
  private timerEl:   HTMLElement | null = null;
  private scoreEl:   HTMLElement | null = null;
  private timeBarEl: HTMLElement | null = null;
  private score  = 0;
  private mode: GameMode = 'PERFECT_CUT';

  mount(container: HTMLElement): void {
    this.container = container;
    this.mode = this.pickMode();
    this.render();
    this.startCountdown();
  }

  unmount(): void {
    this.engine.stop();
    this.container = null;
  }

  // ─── Mode selection ───────────────────────────────────────────────────────

  private pickMode(): GameMode {
    // URL param override for testing: #/game?type=PC or ?type=MR or ?type=TG
    const params = router.currentParams();
    const t = params['type'];
    if (t === 'PC') return 'PERFECT_CUT';
    if (t === 'MR') return 'MATCH_RHYTHM';
    if (t === 'TG') return 'TAP_GRID';
    // Random between the two new games
    return Math.random() < 0.5 ? 'PERFECT_CUT' : 'MATCH_RHYTHM';
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  private render(): void {
    if (!this.container) return;

    const label = this.mode === 'PERFECT_CUT' ? 'The Perfect Cut'
                : this.mode === 'MATCH_RHYTHM' ? 'Match the Rhythm'
                : 'TapGrid';

    this.container.innerHTML = `
      <div class="screen">

        <!-- HUD -->
        <div style="
          display:flex; align-items:center; justify-content:space-between;
          padding:1rem 1.5rem 0.5rem; flex-shrink:0;
        ">
          <div>
            <div style="color:var(--color-muted);font-size:0.55rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:2px;">${label}</div>
            <div id="score-el" style="
              font-size:2.5rem; font-weight:700; line-height:1;
              font-variant-numeric:tabular-nums; color:#fff; transition:color 0.1s;
            ">0</div>
          </div>
          <div style="text-align:right;">
            <div style="color:var(--color-muted);font-size:0.55rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:2px;">Time</div>
            <div id="timer-el" style="
              font-size:2.5rem; font-weight:700; line-height:1;
              font-variant-numeric:tabular-nums; color:var(--color-accent); transition:color 0.3s;
            ">${GAME_DURATION[this.mode] / 1000}</div>
          </div>
        </div>

        <!-- Time bar -->
        <div style="height:2px; background:var(--color-border); margin:0 1.5rem; border-radius:2px; overflow:hidden; flex-shrink:0;">
          <div id="time-bar" style="height:100%; width:100%; background:var(--color-accent); transform-origin:left center; transition:background 0.3s;"></div>
        </div>

        <!-- Game canvas area -->
        <div id="game-area" style="
          flex:1; display:flex; align-items:center; justify-content:center;
          padding:0.5rem 1rem; overflow:hidden;
        ">
          <div id="game-mount" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;"></div>
        </div>

        <!-- Countdown overlay -->
        <div id="countdown-overlay" style="
          position:absolute; inset:0; background:rgba(10,10,15,0.93);
          display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:10;
        ">
          <div style="color:var(--color-muted);font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.75rem;">
            ${this.mode === 'PERFECT_CUT' ? '⚡ Hit the zone' : this.mode === 'MATCH_RHYTHM' ? '🎵 Match the ring' : 'Tap the cell'}
          </div>
          <div id="countdown-num" style="
            font-size:7rem; font-weight:800; line-height:1;
            color:var(--color-accent); text-shadow:0 0 40px rgba(34,211,238,0.8);
          ">3</div>
          <p style="color:var(--color-muted);font-size:0.875rem;margin-top:1.25rem;letter-spacing:0.04em;">
            ${this.mode === 'PERFECT_CUT' ? 'Tap when the pointer is in the zone' : this.mode === 'MATCH_RHYTHM' ? 'Tap when the ring reaches the center' : 'Tap the glowing cell'}
          </p>
        </div>

        <!-- Game-over overlay -->
        <div id="gameover-overlay" style="
          position:absolute; inset:0; background:rgba(10,10,15,0.96);
          display:none; flex-direction:column; align-items:center; justify-content:center; z-index:10;
        ">
          <div style="color:var(--color-muted);font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.5rem;">Ghost Captured</div>
          <div id="final-score-el" style="
            font-size:6rem; font-weight:800; line-height:1;
            color:var(--color-accent); text-shadow:0 0 48px rgba(34,211,238,0.7);
          ">0</div>
          <div style="color:var(--color-muted);font-size:0.8rem;margin-top:0.4rem;">
            ${this.mode === 'PERFECT_CUT' ? 'hits before a miss' : this.mode === 'MATCH_RHYTHM' ? 'rhythm points' : 'hits in 30 seconds'}
          </div>
          <div style="margin-top:2rem; display:flex; align-items:center; gap:0.5rem; color:var(--color-ghost); font-size:0.8rem;">
            <span>👻</span><span>Generating QR code...</span>
          </div>
        </div>

      </div>
    `;

    this.timerEl   = this.container.querySelector('#timer-el');
    this.scoreEl   = this.container.querySelector('#score-el');
    this.timeBarEl = this.container.querySelector('#time-bar');
  }

  // ─── Countdown ────────────────────────────────────────────────────────────

  private startCountdown(): void {
    const overlay = this.container?.querySelector('#countdown-overlay') as HTMLElement | null;
    const numEl   = this.container?.querySelector('#countdown-num')    as HTMLElement | null;
    if (!overlay || !numEl) return;

    const steps = ['3', '2', '1', 'GO!'];
    let i = 0;

    const step = () => {
      if (i >= steps.length) {
        overlay.style.opacity    = '0';
        overlay.style.transition = 'opacity 0.2s ease';
        setTimeout(() => { overlay.style.display = 'none'; this.beginGame(); }, 200);
        return;
      }
      numEl.style.transition = 'none';
      numEl.style.transform  = 'scale(0.55)';
      numEl.style.opacity    = '0';
      numEl.textContent = steps[i];
      requestAnimationFrame(() => requestAnimationFrame(() => {
        numEl.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease';
        numEl.style.transform  = 'scale(1)';
        numEl.style.opacity    = '1';
      }));
      i++;
      setTimeout(step, i === steps.length ? 420 : 750);
    };

    setTimeout(step, 300);
  }

  // ─── Game begin ───────────────────────────────────────────────────────────

  private beginGame(): void {
    if (!sessionService.load()) sessionService.create('tmp', 'Test run');

    const startTime = performance.now();
    this.recorder.start(startTime);
    sessionService.armDnfGuard(sessionService.load()?.id ?? 'tmp');
    sessionService.setState('PLAYING');

    const mountEl = this.container?.querySelector('#game-mount') as HTMLElement;
    const duration = GAME_DURATION[this.mode];

    if (this.mode === 'PERFECT_CUT') {
      const game = new PerfectCut();
      game.mount(mountEl, {
        onScore:  (s)    => this.updateScore(s),
        onRecord: (data) => this.recorder.push(data),
        onEnd:    ()     => this.engine.forceEnd(),
      });
      game.start(startTime);
    } else if (this.mode === 'MATCH_RHYTHM') {
      const game = new MatchRhythm();
      game.mount(mountEl, {
        onScore:  (s)    => this.updateScore(s),
        onRecord: (data) => this.recorder.push(data),
      });
      game.start(startTime);
    } else {
      const grid = new TapGrid();
      grid.mount(mountEl, {
        onScore:  (s)    => this.updateScore(s),
        onRecord: (data) => this.recorder.push(data),
      });
      grid.start(startTime);
    }

    this.engine.start(duration, (_e, remaining) => this.onTick(remaining, duration), () => this.onGameOver());
  }

  // ─── Tick ────────────────────────────────────────────────────────────────

  private onTick(remaining: number, duration: number): void {
    const secs     = Math.ceil(remaining / 1000);
    const progress = remaining / duration;
    const critical = secs <= 5;

    if (this.timerEl) {
      this.timerEl.textContent = String(secs);
      this.timerEl.style.color = critical ? 'var(--color-danger)' : 'var(--color-accent)';
    }
    if (this.timeBarEl) {
      this.timeBarEl.style.transform  = `scaleX(${progress})`;
      this.timeBarEl.style.background = critical ? 'var(--color-danger)' : 'var(--color-accent)';
    }
  }

  private updateScore(score: number): void {
    this.score = score;
    if (!this.scoreEl) return;
    this.scoreEl.textContent = String(score);
    this.scoreEl.style.color = 'var(--color-accent)';
    setTimeout(() => { if (this.scoreEl) this.scoreEl.style.color = '#fff'; }, 140);
  }

  // ─── Game over ────────────────────────────────────────────────────────────

  private onGameOver(): void {
    const events = this.recorder.stop();
    sessionService.disarmDnfGuard();

    const timeline: GhostTimeline = {
      v:        1,
      mode:     this.mode,
      duration: GAME_DURATION[this.mode],
      score:    this.score,
      events,
    };
    sessionService.setTimeline(timeline);
    sessionService.setState('SEALED');

    const overlay = this.container?.querySelector('#gameover-overlay') as HTMLElement | null;
    const finalEl = this.container?.querySelector('#final-score-el')   as HTMLElement | null;
    if (overlay && finalEl) {
      finalEl.textContent   = String(this.score);
      overlay.style.display = 'flex';
    }

    setTimeout(() => router.navigate('result'), 2200);
  }
}
