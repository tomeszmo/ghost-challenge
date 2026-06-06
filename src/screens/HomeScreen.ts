import type { Screen } from '../app';
import { router } from '../utils/router';

export class HomeScreen implements Screen {
  private container: HTMLElement | null = null;

  mount(container: HTMLElement): void {
    this.container = container;
    this.render();
    this.checkDnf();
  }

  unmount(): void {
    this.container = null;
  }

  private render(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="screen anim-fade-in" style="align-items:center; justify-content:center; padding:2rem;">

        <div class="anim-ghost-float" style="font-size:4rem; line-height:1; margin-bottom:1rem;">👻</div>

        <h1 class="neon-text-accent" style="
          font-size:2rem; font-weight:700; margin:0 0 0.5rem; letter-spacing:-0.02em;
        ">ChallengeGhost</h1>

        <p style="color:var(--color-muted); font-size:0.875rem; margin:0 0 3rem; line-height:1.5; text-align:center;">
          Issue a micro-challenge.<br>Bet on the outcome. Let the ghost decide.
        </p>

        <div style="width:100%; max-width:22rem; display:flex; flex-direction:column; gap:0.875rem;">
          <button id="btn-create" class="btn-primary">Create Challenge</button>
          <button id="btn-scan" class="btn-ghost-style">Scan to Play</button>
        </div>

      </div>
    `;

    this.container.querySelector('#btn-create')?.addEventListener('click', () => {
      router.navigate('stake');
    });

    this.container.querySelector('#btn-scan')?.addEventListener('click', () => {
      this.showScanTip();
    });
  }

  private showScanTip(): void {
    const screen = this.container?.querySelector('.screen');
    if (!screen) return;

    screen.querySelector('#scan-tip')?.remove();

    const tip = document.createElement('div');
    tip.id = 'scan-tip';
    tip.style.cssText = `
      position:absolute; bottom:5rem; left:1.25rem; right:1.25rem;
      background:rgba(168,85,247,0.1);
      border:1px solid rgba(168,85,247,0.28);
      border-radius:1rem; padding:1rem 1.1rem;
      z-index:20; animation:slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both;
      text-align:center;
    `;
    tip.innerHTML = `
      <div style="color:var(--color-ghost);font-size:0.8rem;font-weight:600;margin-bottom:0.3rem;">👻 How to receive a challenge</div>
      <div style="color:var(--color-muted);font-size:0.8rem;line-height:1.5;">
        Scan your challenger's QR code with your phone's camera app, or ask them to share the link directly.
      </div>
    `;
    screen.appendChild(tip);

    setTimeout(() => {
      tip.style.transition = 'opacity 0.35s ease';
      tip.style.opacity = '0';
      setTimeout(() => tip.remove(), 380);
    }, 4000);
  }

  /** Surfaces the "you chickened out" shame toast if a DNF was detected on load. */
  private checkDnf(): void {
    const stake = sessionStorage.getItem('cg_dnf_stake');
    if (!stake) return;
    sessionStorage.removeItem('cg_dnf_stake');
    this.showDnfToast(stake);
  }

  private showDnfToast(stake: string): void {
    const screen = this.container?.querySelector('.screen');
    if (!screen) return;

    const toast = document.createElement('div');
    toast.style.cssText = `
      position:absolute; top:1.25rem; left:1.25rem; right:1.25rem;
      background:rgba(248,113,113,0.1);
      border:1px solid rgba(248,113,113,0.35);
      border-radius:1rem; padding:1rem 1.1rem;
      z-index:20; animation:slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
    `;
    toast.innerHTML = `
      <div style="color:var(--color-danger); font-size:0.72rem; font-weight:700;
        letter-spacing:0.08em; text-transform:uppercase; margin-bottom:0.3rem;">
        👻 You chickened out
      </div>
      <div style="color:#fff; font-size:0.95rem; font-weight:600;">
        &ldquo;${escapeHtml(stake)}&rdquo;
      </div>
      <div style="color:var(--color-muted); font-size:0.75rem; margin-top:0.25rem;">
        That one's still on you. Try again?
      </div>
    `;
    screen.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-6px)';
      setTimeout(() => toast.remove(), 420);
    }, 4500);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
