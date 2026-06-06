import type { Screen } from '../app';
import type { ChallengeSession, PackedChallenge } from '../types/challenge';
import { sessionService } from '../services/SessionService';
import { qrService } from '../services/QRService';
import { router } from '../utils/router';

export class ResultScreen implements Screen {
  private container: HTMLElement | null = null;
  private session: ChallengeSession | null = null;

  mount(container: HTMLElement): void {
    this.container = container;
    this.session = sessionService.load();
    this.renderScore();
  }

  unmount(): void {
    this.container = null;
  }

  // ─── Score view ──────────────────────────────────────────────────────────────

  private renderScore(): void {
    if (!this.container) return;

    const score    = this.session?.timeline?.score ?? 0;
    const stake    = this.session?.stake ?? '—';
    const canShare = !!this.session?.timeline;

    this.container.innerHTML = `
      <div class="screen anim-fade-in" style="align-items:center;justify-content:center;padding:2rem;">

        <div class="anim-ghost-float" style="font-size:3.5rem;line-height:1;margin-bottom:1.25rem;">👻</div>

        <div style="color:var(--color-muted);font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.4rem;">
          Ghost Recorded
        </div>
        <div style="
          font-size:5.5rem;font-weight:800;line-height:1;
          color:var(--color-accent);
          text-shadow:0 0 48px rgba(34,211,238,0.6);
          margin-bottom:0.25rem;
        ">${score}</div>
        <div style="color:var(--color-muted);font-size:0.82rem;margin-bottom:2rem;">
          hits in 30 seconds
        </div>

        <div class="panel" style="width:100%;max-width:22rem;text-align:center;margin-bottom:2rem;">
          <div style="color:var(--color-muted);font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem;">The Stake</div>
          <div style="font-size:1.05rem;font-weight:600;color:#fff;">${esc(stake)}</div>
        </div>

        <div style="width:100%;max-width:22rem;display:flex;flex-direction:column;gap:0.75rem;">
          <button id="btn-share" class="btn-primary" ${canShare ? '' : 'disabled style="opacity:0.35;box-shadow:none;"'}>
            Share via QR
          </button>
          <button id="btn-again" class="btn-ghost-style">Play Again</button>
        </div>

      </div>
    `;

    this.container.querySelector('#btn-share')?.addEventListener('click', () => {
      if (canShare && this.session) this.renderQR(this.session);
    });

    this.container.querySelector('#btn-again')?.addEventListener('click', () => {
      sessionService.clear();
      router.navigate('home');
    });
  }

  // ─── QR view ─────────────────────────────────────────────────────────────────

  private renderQR(session: ChallengeSession): void {
    if (!this.container || !session.timeline) return;

    const packed: PackedChallenge = {
      id:        session.id,
      stake:     session.stake,
      createdAt: session.createdAt,
      timeline:  session.timeline,
    };

    this.container.innerHTML = `
      <div class="screen anim-fade-in" style="justify-content:flex-start;">

        <!-- Nav -->
        <div style="padding:1rem 1.5rem 0.25rem;flex-shrink:0;">
          <button id="btn-back" style="
            background:none;border:none;color:var(--color-muted);
            font-size:0.875rem;cursor:pointer;padding:0.25rem 0;
            display:flex;align-items:center;gap:0.35rem;font-family:inherit;
          ">← Back</button>
        </div>

        <!-- Scrollable body -->
        <div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0.75rem 1.5rem 1.5rem;display:flex;flex-direction:column;align-items:center;">

          <!-- Context -->
          <div style="text-align:center;margin-bottom:1.5rem;width:100%;max-width:22rem;">
            <div style="color:var(--color-muted);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem;">
              Challenge QR
            </div>
            <div style="font-size:1rem;font-weight:600;color:#fff;margin-bottom:0.25rem;">
              &ldquo;${esc(session.stake)}&rdquo;
            </div>
            <div style="color:var(--color-muted);font-size:0.8rem;">
              Beat <span style="color:var(--color-accent);font-weight:700;">${session.timeline.score}</span> hits to win
            </div>
          </div>

          <!-- QR panel -->
          <div style="
            background:var(--color-panel);
            border:1.5px solid var(--color-border);
            border-radius:1.25rem;
            padding:1.25rem;
            margin-bottom:1.25rem;
            display:inline-flex;
            align-items:center;justify-content:center;
          ">
            <div id="qr-mount" style="line-height:0;border-radius:0.625rem;overflow:hidden;"></div>
          </div>

          <!-- Subtext -->
          <p style="color:var(--color-muted);font-size:0.78rem;text-align:center;margin:0 0 1.25rem;line-height:1.5;">
            Receiver gets <span class="neon-text-ghost" style="font-weight:600;">one shot</span>. The ghost will haunt them.
          </p>

          <!-- Copy link fallback -->
          <div style="width:100%;max-width:22rem;">
            <button id="btn-copy" style="
              width:100%;background:var(--color-panel);
              border:1px solid var(--color-border);
              border-radius:0.875rem;padding:0.75rem;
              color:var(--color-muted);font-size:0.875rem;
              cursor:pointer;font-family:inherit;
              transition:border-color 0.15s,color 0.15s;
            ">Copy Link</button>
          </div>

        </div>
      </div>
    `;

    // Back button
    this.container.querySelector('#btn-back')?.addEventListener('click', () => this.renderScore());

    // Generate QR (do this after DOM is ready)
    const qrMount = this.container.querySelector('#qr-mount') as HTMLElement;
    let shareUrl = '';
    try {
      shareUrl = qrService.generate(packed, qrMount);
    } catch (e) {
      qrMount.innerHTML = `<div style="width:264px;height:264px;display:flex;align-items:center;justify-content:center;color:var(--color-muted);font-size:0.8rem;">QR failed</div>`;
    }

    // Copy button
    const btnCopy = this.container.querySelector('#btn-copy') as HTMLButtonElement;
    btnCopy?.addEventListener('click', () => {
      const url = shareUrl || qrService.buildUrl('');
      navigator.clipboard.writeText(url).then(() => {
        btnCopy.textContent = '✓ Copied!';
        btnCopy.style.borderColor = 'var(--color-accent)';
        btnCopy.style.color = 'var(--color-accent)';
        setTimeout(() => {
          btnCopy.textContent = 'Copy Link';
          btnCopy.style.borderColor = 'var(--color-border)';
          btnCopy.style.color = 'var(--color-muted)';
        }, 2200);
      }).catch(() => {
        btnCopy.textContent = 'Long-press to copy';
      });
    });
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
