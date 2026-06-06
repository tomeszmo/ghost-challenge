import { router } from './utils/router';
import { sessionService } from './services/SessionService';
import type { Route, RouteChangeEvent } from './utils/router';

export interface Screen {
  mount(container: HTMLElement): void;
  unmount(): void;
}

class App {
  private readonly container: HTMLElement;
  private currentScreen: Screen | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  init(): void {
    this.checkDnf();
    router.onChange((event) => void this.handleRoute(event));
    router.init();
  }

  /** Detects a mid-game tab-close and marks the session as DNF before routing. */
  private checkDnf(): void {
    const dnfId = sessionService.getPendingDnf();
    if (!dnfId) return;

    sessionService.disarmDnfGuard();
    const session = sessionService.load();

    if (session?.state === 'PLAYING') {
      // Stash the stake so HomeScreen can surface the shame toast
      sessionStorage.setItem('cg_dnf_stake', session.stake);
      sessionService.setState('DNF');
      sessionService.clear();
    }
  }

  private async handleRoute(event: RouteChangeEvent): Promise<void> {
    if (this.currentScreen) {
      const el = this.container.firstElementChild as HTMLElement | null;
      if (el) {
        el.style.transition = 'opacity 0.15s ease';
        el.style.opacity = '0';
        await new Promise<void>((r) => setTimeout(r, 160));
      }
      this.currentScreen.unmount();
      this.container.innerHTML = '';
    }
    const screen = await this.resolveScreen(event.route, event.params);
    this.currentScreen = screen;
    screen.mount(this.container);
  }

  private async resolveScreen(
    route: Route,
    params: Record<string, string>,
  ): Promise<Screen> {
    switch (route) {
      case 'home': {
        const { HomeScreen } = await import('./screens/HomeScreen');
        return new HomeScreen();
      }
      case 'stake': {
        const { StakeScreen } = await import('./screens/StakeScreen');
        return new StakeScreen();
      }
      case 'game': {
        const { GameScreen } = await import('./screens/GameScreen');
        return new GameScreen();
      }
      case 'result': {
        const { ResultScreen } = await import('./screens/ResultScreen');
        return new ResultScreen();
      }
      case 'receive': {
        const { ReceiverScreen } = await import('./screens/ReceiverScreen');
        return new ReceiverScreen(params['d'] ?? '');
      }
      default:
        return this.resolveScreen('home', {});
    }
  }
}

export { App };
