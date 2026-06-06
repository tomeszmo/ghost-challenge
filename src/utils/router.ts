export type Route = 'home' | 'stake' | 'game' | 'result' | 'receive';

export interface RouteChangeEvent {
  route: Route;
  params: Record<string, string>;
}

type RouteHandler = (event: RouteChangeEvent) => void;

const VALID_ROUTES: Route[] = ['home', 'stake', 'game', 'result', 'receive'];

class Router {
  private handlers: RouteHandler[] = [];

  init(): void {
    window.addEventListener('hashchange', () => this.dispatch());
    this.dispatch();
  }

  navigate(route: Route, params: Record<string, string> = {}): void {
    const query = new URLSearchParams(params).toString();
    window.location.hash = query ? `#/${route}?${query}` : `#/${route}`;
  }

  currentParams(): Record<string, string> {
    return this.parse().params;
  }

  onChange(handler: RouteHandler): void {
    this.handlers.push(handler);
  }

  private parse(): RouteChangeEvent {
    const hash = window.location.hash.slice(1) || '/home';
    const [path, queryString] = hash.split('?');
    const routeStr = path.replace(/^\//, '') || 'home';
    const route = (VALID_ROUTES.includes(routeStr as Route) ? routeStr : 'home') as Route;
    const params: Record<string, string> = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((v, k) => {
        params[k] = v;
      });
    }
    return { route, params };
  }

  private dispatch(): void {
    const event = this.parse();
    this.handlers.forEach((h) => h(event));
  }
}

export const router = new Router();
