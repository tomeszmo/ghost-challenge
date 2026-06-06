import { nanoid } from 'nanoid';
import type { Screen } from '../app';
import { sessionService } from '../services/SessionService';
import { router } from '../utils/router';

const MAX = 60;

const EXAMPLES = [
  "Tonight's drinks on you 🍺",
  "Loser buys coffee ☕",
  "You cook dinner for a week 🍝",
  "Loser does the dishes",
];

export class StakeScreen implements Screen {
  private container: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private charCountEl: HTMLElement | null = null;
  private btnStart: HTMLButtonElement | null = null;
  private vpListener: (() => void) | null = null;

  mount(container: HTMLElement): void {
    this.container = container;
    this.render();
    this.bindViewport();
    setTimeout(() => this.inputEl?.focus(), 180);
  }

  unmount(): void {
    if (this.vpListener) {
      window.visualViewport?.removeEventListener('resize', this.vpListener);
    }
    this.container = null;
  }

  private render(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="screen anim-fade-in" style="justify-content:flex-start;">

        <!-- Nav -->
        <div style="padding:1rem 1.5rem 0.25rem; flex-shrink:0;">
          <button id="btn-back" style="
            background:none; border:none; color:var(--color-muted);
            font-size:0.875rem; cursor:pointer; padding:0.25rem 0;
            display:flex; align-items:center; gap:0.35rem; font-family:inherit;
          ">← Back</button>
        </div>

        <!-- Scrollable body -->
        <div style="flex:1; overflow-y:auto; padding:0.5rem 1.5rem 0; -webkit-overflow-scrolling:touch;">

          <!-- Prompt -->
          <div style="margin-bottom:2rem; margin-top:0.5rem;">
            <h1 style="font-size:1.75rem; font-weight:700; margin:0 0 0.4rem; letter-spacing:-0.02em; line-height:1.2;">
              What's the wager?
            </h1>
            <p style="color:var(--color-muted); font-size:0.875rem; margin:0; line-height:1.5;">
              Loser pays up. Make it sting.
            </p>
          </div>

          <!-- Input card -->
          <div id="input-panel" style="
            background:var(--color-panel);
            border:1.5px solid var(--color-border);
            border-radius:1rem;
            padding:1rem 1rem 0.6rem;
            margin-bottom:1.25rem;
            transition:border-color 0.2s, box-shadow 0.2s;
          ">
            <input
              id="stake-input"
              type="text"
              maxlength="${MAX}"
              placeholder="Tonight's drinks on you..."
              autocomplete="off"
              autocorrect="off"
              autocapitalize="sentences"
              spellcheck="false"
              style="
                width:100%; background:none; border:none; outline:none;
                font-size:1.15rem; font-weight:500; color:#fff;
                caret-color:var(--color-accent);
                line-height:1.5; font-family:inherit;
              "
            />
            <div style="display:flex; justify-content:flex-end; margin-top:0.35rem;">
              <span id="char-count" style="
                font-size:0.68rem; color:var(--color-border);
                font-variant-numeric:tabular-nums; transition:color 0.2s;
              ">0 / ${MAX}</span>
            </div>
          </div>

          <!-- Quick picks -->
          <div style="margin-bottom:2rem;">
            <div style="
              color:var(--color-muted); font-size:0.62rem;
              letter-spacing:0.1em; text-transform:uppercase; margin-bottom:0.6rem;
            ">Quick picks</div>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
              ${EXAMPLES.map((ex, i) => `
                <button data-chip="${i}" style="
                  background:var(--color-panel); border:1px solid var(--color-border);
                  border-radius:999px; padding:0.4rem 0.9rem;
                  color:var(--color-muted); font-size:0.78rem;
                  cursor:pointer; white-space:nowrap;
                  font-family:inherit; transition:border-color 0.15s, color 0.15s;
                ">${ex}</button>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- Bottom CTA — stays above keyboard via visualViewport -->
        <div id="cta-wrap" style="padding:0.75rem 1.5rem 1.5rem; flex-shrink:0; transition:transform 0.1s ease-out;">
          <button id="btn-start" class="btn-primary" disabled style="
            opacity:0.3; box-shadow:none;
            transition:opacity 0.2s ease, box-shadow 0.2s ease;
          ">
            Start Sharp Challenge
          </button>
          <p style="
            text-align:center; font-size:0.68rem; color:var(--color-muted);
            margin:0.6rem 0 0; line-height:1.5;
          ">
            Quitting mid-game = automatic forfeit. No chickening out.
          </p>
        </div>

      </div>
    `;

    this.inputEl    = this.container.querySelector('#stake-input');
    this.charCountEl = this.container.querySelector('#char-count');
    this.btnStart   = this.container.querySelector('#btn-start');
    const panel     = this.container.querySelector('#input-panel') as HTMLElement;

    this.inputEl?.addEventListener('input', () => this.onInput());
    this.inputEl?.addEventListener('focus', () => {
      panel.style.borderColor = 'var(--color-accent)';
      panel.style.boxShadow   = '0 0 12px rgba(34,211,238,0.15)';
    });
    this.inputEl?.addEventListener('blur', () => {
      panel.style.borderColor = 'var(--color-border)';
      panel.style.boxShadow   = 'none';
    });

    this.container.querySelector('#btn-back')?.addEventListener('click', () => {
      router.navigate('home');
    });

    this.container.querySelectorAll('[data-chip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i   = parseInt((btn as HTMLElement).dataset['chip'] ?? '0', 10);
        const txt = EXAMPLES[i] ?? '';
        if (this.inputEl) { this.inputEl.value = txt; this.onInput(); this.inputEl.focus(); }
      });
    });

    this.btnStart?.addEventListener('click', () => this.handleStart());
  }

  private onInput(): void {
    const val = this.inputEl?.value ?? '';
    const len = val.length;

    if (this.charCountEl) {
      this.charCountEl.textContent = `${len} / ${MAX}`;
      this.charCountEl.style.color =
        len >= MAX * 0.85 ? 'var(--color-danger)' : 'var(--color-border)';
    }

    if (this.btnStart) {
      const ok = val.trim().length > 0;
      this.btnStart.disabled         = !ok;
      this.btnStart.style.opacity    = ok ? '1'    : '0.3';
      this.btnStart.style.boxShadow  = ok ? '0 0 24px rgba(34,211,238,0.35)' : 'none';
    }
  }

  private handleStart(): void {
    const stake = this.inputEl?.value.trim() ?? '';
    if (!stake) return;

    const id = nanoid(10);
    sessionService.create(id, stake);

    if (this.btnStart) {
      this.btnStart.textContent = 'Locked in 🔒';
      this.btnStart.disabled = true;
      this.btnStart.style.boxShadow = '0 0 24px rgba(34,211,238,0.2)';
    }

    setTimeout(() => router.navigate('game'), 380);
  }

  private bindViewport(): void {
    const ctaWrap = this.container?.querySelector('#cta-wrap') as HTMLElement | null;
    if (!ctaWrap || !window.visualViewport) return;

    this.vpListener = () => {
      const vv     = window.visualViewport!;
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      ctaWrap.style.transform = offset > 0 ? `translateY(-${Math.round(offset)}px)` : '';
    };

    window.visualViewport.addEventListener('resize', this.vpListener);
  }
}
