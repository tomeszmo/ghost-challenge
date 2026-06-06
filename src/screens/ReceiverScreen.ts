import type { Screen } from '../app';
import type { PackedChallenge } from '../types/challenge';
import { GameEngine } from '../game/GameEngine';
import { GhostRecorder } from '../game/GhostRecorder';
import { TapGrid } from '../game/minigames/TapGrid';
import { PerfectCut } from '../game/minigames/PerfectCut';
import { MatchRhythm } from '../game/minigames/MatchRhythm';
import { GhostPlayer } from '../game/GhostPlayer';
import { sessionService } from '../services/SessionService';
import { unpack } from '../utils/compress';
import { router } from '../utils/router';
import { GAME_DURATION } from '../types/game';

const PLAYED_PREFIX = 'cg_played_';

export class ReceiverScreen implements Screen {
  private readonly rawPayload: string;
  private container: HTMLElement | null = null;
  private engine      = new GameEngine();
  private recorder    = new GhostRecorder();
  private ghostPlayer = new GhostPlayer(); // legacy TapGrid ghost
  private score       = 0;
  private timerEl:    HTMLElement | null = null;
  private scoreEl:    HTMLElement | null = null;
  private timeBarEl:  HTMLElement | null = null;

  constructor(payload: string) { this.rawPayload = payload; }

  mount(container: HTMLElement): void {
    this.container = container;

    if (!this.rawPayload) { this.showError('No challenge data found in this link.'); return; }

    const challenge = unpack(this.rawPayload);
    if (!challenge) { this.showError('This challenge link is invalid or has expired.'); return; }

    if (sessionService.load()?.id === challenge.id) { this.showOwnChallenge(challenge); return; }

    if (localStorage.getItem(PLAYED_PREFIX + challenge.id)) { this.showUsedUp(challenge); return; }

    this.showDilemma(challenge);
  }

  unmount(): void {
    this.engine.stop();
    this.ghostPlayer.stop();
    this.container = null;
  }

  // ─── Same-device guard ───────────────────────────────────────────────────

  private showOwnChallenge(challenge: PackedChallenge): void {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="screen anim-fade-in" style="align-items:center;justify-content:center;padding:2rem;text-align:center;">
        <div class="anim-ghost-float" style="font-size:3rem;margin-bottom:1.25rem;">👻</div>
        <p style="color:var(--color-accent);font-weight:700;font-size:1.05rem;margin:0 0 0.5rem;">That's your challenge!</p>
        <p style="color:var(--color-muted);font-size:0.875rem;margin:0 0 0.4rem;line-height:1.5;">
          You set the ghost for<br><span style="color:#fff;font-weight:600;">&ldquo;${esc(challenge.stake)}&rdquo;</span>
        </p>
        <p style="color:var(--color-muted);font-size:0.875rem;margin:0 0 2rem;line-height:1.5;">
          Send this to your challenger — they get one shot to beat
          <span style="color:var(--color-accent);font-weight:600;">${challenge.timeline.score}</span>.
        </p>
        <button id="btn-home" class="btn-ghost-style" style="max-width:22rem;">Back</button>
      </div>`;
    this.container.querySelector('#btn-home')?.addEventListener('click', () => router.navigate('home'));
  }

  // ─── Error states ────────────────────────────────────────────────────────

  private showError(msg: string): void {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="screen anim-fade-in" style="align-items:center;justify-content:center;padding:2rem;text-align:center;">
        <div style="font-size:3rem;margin-bottom:1rem;">💀</div>
        <p style="color:var(--color-danger);font-weight:700;margin:0 0 0.5rem;">Dead Link</p>
        <p style="color:var(--color-muted);font-size:0.875rem;margin:0 0 2rem;">${msg}</p>
        <button id="btn-home" class="btn-primary">Go Home</button>
      </div>`;
    this.container.querySelector('#btn-home')?.addEventListener('click', () => router.navigate('home'));
  }

  private showUsedUp(challenge: PackedChallenge): void {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="screen anim-fade-in" style="align-items:center;justify-content:center;padding:2rem;text-align:center;">
        <div style="font-size:3rem;margin-bottom:1rem;">🔒</div>
        <p style="color:var(--color-danger);font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;margin:0 0 0.5rem;">Attempt Consumed</p>
        <p style="color:#fff;font-size:1.1rem;font-weight:600;margin:0 0 0.4rem;">&ldquo;${esc(challenge.stake)}&rdquo;</p>
        <p style="color:var(--color-muted);font-size:0.875rem;margin:0 0 2rem;">You already used your one shot at this challenge.</p>
        <button id="btn-home" class="btn-ghost-style">Go Home</button>
      </div>`;
    this.container.querySelector('#btn-home')?.addEventListener('click', () => router.navigate('home'));
  }

  // ─── Dilemma dialog ───────────────────────────────────────────────────────

  private showDilemma(challenge: PackedChallenge): void {
    if (!this.container) return;
    const modeLabel = challenge.timeline.mode === 'PERFECT_CUT' ? '⚡ The Perfect Cut'
                    : challenge.timeline.mode === 'MATCH_RHYTHM' ? '🎵 Match the Rhythm'
                    : '🎯 TapGrid';

    this.container.innerHTML = `
      <div class="screen anim-fade-in" style="
        align-items:center;justify-content:center;
        padding:2rem;overflow-y:auto;-webkit-overflow-scrolling:touch;">
        <div style="width:100%;max-width:22rem;display:flex;flex-direction:column;align-items:center;">

          <div class="anim-ghost-float" style="font-size:3.5rem;line-height:1;margin-bottom:1.5rem;">👻</div>

          <div style="color:var(--color-ghost);font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.4rem;">${modeLabel}</div>
          <div style="color:var(--color-muted);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.75rem;">The Wager</div>

          <div class="panel" style="width:100%;text-align:center;margin-bottom:1.75rem;">
            <div style="font-size:1.1rem;font-weight:600;color:#fff;">&ldquo;${esc(challenge.stake)}&rdquo;</div>
          </div>

          <div style="text-align:center;margin-bottom:1.75rem;">
            <div style="color:var(--color-muted);font-size:0.8rem;margin-bottom:0.35rem;">Score to beat</div>
            <div style="font-size:4.5rem;font-weight:800;line-height:1;color:var(--color-accent);text-shadow:0 0 36px rgba(34,211,238,0.65);">${challenge.timeline.score}</div>
            <div style="color:var(--color-muted);font-size:0.75rem;margin-top:0.3rem;">${challenge.timeline.mode === 'MATCH_RHYTHM' ? 'rhythm points' : 'hits in ' + (challenge.timeline.duration / 1000) + 's'}</div>
          </div>

          <div style="width:100%;background:rgba(168,85,247,0.07);border:1px solid rgba(168,85,247,0.22);border-radius:1rem;padding:1rem;margin-bottom:1.75rem;">
            <div style="color:var(--color-ghost);font-size:0.68rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.35rem;">⚠ One Attempt Only</div>
            <div style="color:var(--color-muted);font-size:0.8rem;line-height:1.55;">The ghost will haunt the game in real time. Once you accept, there is no second chance.</div>
          </div>

          <div style="width:100%;display:flex;flex-direction:column;gap:0.75rem;">
            <button id="btn-accept" class="btn-primary">Accept the Challenge</button>
            <button id="btn-decline" class="btn-danger">Decline</button>
          </div>
        </div>
      </div>`;

    this.container.querySelector('#btn-accept')?.addEventListener('click', () => this.beginChallenge(challenge));
    this.container.querySelector('#btn-decline')?.addEventListener('click', () => router.navigate('home'));
  }

  // ─── Game ─────────────────────────────────────────────────────────────────

  private beginChallenge(challenge: PackedChallenge): void {
    localStorage.setItem(PLAYED_PREFIX + challenge.id, '1');
    if (!this.container) return;

    const mode     = challenge.timeline.mode;
    const duration = GAME_DURATION[mode];

    const scoreLabel = mode === 'MATCH_RHYTHM' ? 'pts' : '';
    const ghostScore = challenge.timeline.score + (scoreLabel ? ' pts' : '');

    this.container.innerHTML = `
      <div class="screen" id="rx-root">

        <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem 0.75rem;flex-shrink:0;">
          <div>
            <div style="color:var(--color-muted);font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;">You</div>
            <div id="rx-score" style="font-size:2.25rem;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;color:#fff;transition:color 0.1s;">0</div>
          </div>
          <div style="text-align:center;">
            <div id="rx-timer" style="font-size:2.25rem;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;color:var(--color-accent);transition:color 0.3s;">${duration / 1000}</div>
          </div>
          <div style="text-align:right;">
            <div style="color:var(--color-ghost);font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;">👻 Ghost</div>
            <div style="font-size:2.25rem;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;color:var(--color-ghost);text-shadow:0 0 14px rgba(168,85,247,0.45);">${ghostScore}</div>
          </div>
        </div>

        <div style="height:2px;background:var(--color-border);margin:0 1.5rem;border-radius:2px;overflow:hidden;flex-shrink:0;">
          <div id="rx-bar" style="height:100%;width:100%;background:var(--color-accent);transform-origin:left;transition:background 0.3s;"></div>
        </div>

        <div id="rx-game-area" style="flex:1;display:flex;align-items:center;justify-content:center;padding:0.5rem 1rem;position:relative;overflow:hidden;">
          <div id="rx-mount" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"></div>
        </div>

        <!-- Countdown -->
        <div id="rx-countdown" style="position:absolute;inset:0;background:rgba(10,10,15,0.93);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;">
          <div style="color:var(--color-ghost);font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.75rem;">👻 Ghost is watching</div>
          <div id="rx-count-num" style="font-size:7rem;font-weight:800;line-height:1;color:var(--color-accent);text-shadow:0 0 40px rgba(34,211,238,0.8);">3</div>
          <p style="color:var(--color-muted);font-size:0.875rem;margin-top:1.25rem;">
            ${mode === 'PERFECT_CUT' ? 'Tap when the pointer is in the zone' : mode === 'MATCH_RHYTHM' ? 'Tap when the ring reaches the center' : 'Tap the glowing cell'}
          </p>
        </div>

        <!-- Result overlay -->
        <div id="rx-result" style="position:absolute;inset:0;background:rgba(10,10,15,0.97);display:none;flex-direction:column;align-items:center;justify-content:center;padding:2rem;z-index:20;"></div>
      </div>`;

    this.timerEl  = this.container.querySelector('#rx-timer');
    this.scoreEl  = this.container.querySelector('#rx-score');
    this.timeBarEl = this.container.querySelector('#rx-bar');

    const mountEl = this.container.querySelector('#rx-mount')  as HTMLElement;
    const rxRoot  = this.container.querySelector('#rx-root')   as HTMLElement;

    const recorder = this.recorder;
    const engine   = this.engine;

    if (mode === 'PERFECT_CUT') {
      const game = new PerfectCut();
      game.loadGhost(challenge.timeline);
      game.mount(mountEl, {
        onScore:  (s)    => this.updateScore(s),
        onRecord: (data) => recorder.push(data),
        onEnd:    ()     => engine.forceEnd(),
      });
      this.runCountdown(() => {
        const st = performance.now();
        recorder.start(st);
        game.start(st);
        engine.start(duration, (_e, r) => this.onTick(r, duration), () => this.onGameOver(challenge));
      });

    } else if (mode === 'MATCH_RHYTHM') {
      const game = new MatchRhythm();
      game.loadGhost(challenge.timeline);
      game.mount(mountEl, {
        onScore:  (s)    => this.updateScore(s),
        onRecord: (data) => recorder.push(data),
      });
      this.runCountdown(() => {
        const st = performance.now();
        recorder.start(st);
        game.start(st);
        engine.start(duration, (_e, r) => this.onTick(r, duration), () => this.onGameOver(challenge));
      });

    } else {
      // TAP_GRID legacy
      const grid = new TapGrid();
      grid.mount(mountEl, {
        onScore:  (s)    => this.updateScore(s),
        onRecord: (data) => recorder.push(data),
      });
      this.ghostPlayer.load(challenge.timeline.events);
      this.runCountdown(() => {
        const st = performance.now();
        recorder.start(st);
        this.ghostPlayer.start(rxRoot, mountEl);
        grid.start(st);
        engine.start(duration, (_e, r) => this.onTick(r, duration), () => { grid.stop(); this.ghostPlayer.stop(); this.onGameOver(challenge); });
      });
    }
  }

  // ─── Countdown ───────────────────────────────────────────────────────────

  private runCountdown(onDone: () => void): void {
    const overlay = this.container?.querySelector('#rx-countdown') as HTMLElement | null;
    const numEl   = this.container?.querySelector('#rx-count-num') as HTMLElement | null;
    if (!overlay || !numEl) return;

    const steps = ['3', '2', '1', 'GO!'];
    let i = 0;

    const step = () => {
      if (i >= steps.length) {
        overlay.style.opacity = '0'; overlay.style.transition = 'opacity 0.2s ease';
        setTimeout(() => { overlay.style.display = 'none'; onDone(); }, 200);
        return;
      }
      numEl.style.transition = 'none'; numEl.style.transform = 'scale(0.55)'; numEl.style.opacity = '0';
      numEl.textContent = steps[i];
      requestAnimationFrame(() => requestAnimationFrame(() => {
        numEl.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease';
        numEl.style.transform  = 'scale(1)'; numEl.style.opacity = '1';
      }));
      i++;
      setTimeout(step, i === steps.length ? 420 : 750);
    };
    setTimeout(step, 400);
  }

  // ─── Tick ────────────────────────────────────────────────────────────────

  private onTick(remaining: number, duration: number): void {
    const secs = Math.ceil(remaining / 1000);
    const crit = secs <= 5;
    if (this.timerEl)  { this.timerEl.textContent = String(secs); this.timerEl.style.color = crit ? 'var(--color-danger)' : 'var(--color-accent)'; }
    if (this.timeBarEl) {
      this.timeBarEl.style.transform  = `scaleX(${remaining / duration})`;
      this.timeBarEl.style.background = crit ? 'var(--color-danger)' : 'var(--color-accent)';
    }
  }

  private updateScore(score: number): void {
    this.score = score;
    if (!this.scoreEl) return;
    this.scoreEl.textContent = String(score);
    this.scoreEl.style.color = 'var(--color-accent)';
    setTimeout(() => { if (this.scoreEl) this.scoreEl.style.color = '#fff'; }, 140);
  }

  // ─── Result ──────────────────────────────────────────────────────────────

  private onGameOver(challenge: PackedChallenge): void {
    const rx  = this.score;
    const gh  = challenge.timeline.score;
    const won  = rx > gh;
    const tied = rx === gh;

    const resultEl = this.container?.querySelector('#rx-result') as HTMLElement | null;
    if (!resultEl) return;

    const accentColor = won ? 'var(--color-success)' : tied ? 'var(--color-accent)' : 'var(--color-danger)';
    const headline    = won ? '🏆 You Win!' : tied ? "👻 It's a Tie!" : '👻 Ghost Wins';
    const subtext     = won
      ? `The ghost is shamed. Pay up — &ldquo;${esc(challenge.stake)}&rdquo;`
      : tied ? 'You matched the ghost exactly. The stakes stand.'
      : `&ldquo;${esc(challenge.stake)}&rdquo; — you know what to do.`;

    resultEl.innerHTML = `
      <div class="anim-slide-up" style="width:100%;max-width:22rem;text-align:center;">
        <div style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:${accentColor};margin-bottom:0.75rem;">${headline}</div>

        <div style="display:flex;align-items:center;justify-content:center;gap:2.5rem;margin-bottom:1.75rem;">
          <div>
            <div style="color:var(--color-muted);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.2rem;">You</div>
            <div style="font-size:4rem;font-weight:800;line-height:1;color:${won ? 'var(--color-success)' : '#fff'};">${rx}</div>
          </div>
          <div style="color:var(--color-muted);font-size:1.1rem;font-weight:300;">vs</div>
          <div>
            <div style="color:var(--color-ghost);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.2rem;">👻 Ghost</div>
            <div style="font-size:4rem;font-weight:800;line-height:1;color:${won ? 'var(--color-muted)' : 'var(--color-ghost)'};${won ? '' : 'text-shadow:0 0 20px rgba(168,85,247,0.5);'}">${gh}</div>
          </div>
        </div>

        <div class="panel" style="margin-bottom:1.75rem;">
          <div style="color:var(--color-muted);font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.35rem;">The Stake</div>
          <div style="color:#fff;font-size:0.95rem;font-weight:500;line-height:1.5;">${subtext}</div>
        </div>

        <button id="rx-done" class="btn-ghost-style">Done</button>
      </div>`;

    resultEl.style.display = 'flex';
    resultEl.querySelector('#rx-done')?.addEventListener('click', () => router.navigate('home'));
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
