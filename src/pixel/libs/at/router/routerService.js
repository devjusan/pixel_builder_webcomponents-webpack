import * as Rxjs from 'rxjs';

/**
 * @typedef BeforeHook
 * @property {((route: any, config: RouterConfig) => void)} resolve
 */

/**
 * @typedef Hooks
 * @property {BeforeHook} onBeforeNavigate
 */

/**
 * @typedef {{fallbackPaths: {authorized: string; unauthorized: string; notFound: string}, hooks: Hooks}} RouterConfig
 */

class RouterService {
  #routeParams;
  constructor() {
    this.events = new Rxjs.BehaviorSubject().pipe(Rxjs.filter((x) => !!x));
    this.navigo = new Navigo('/', {
      hash: true,
    });
  }

  navigate(url) {
    this.navigo.navigate(url);
  }

  /**
   * @param {{path: string; component: string; type: "Public" | "PublicOnly" | "Private";}[]} routes
   * @param {{fallbackPaths: {authorized: string; unauthorized: string; notFound: string}, hooks: Hooks}} config
   */
  configure(routes, config) {
    this.navigo.notFound(() => {
      this.navigate(config.fallbackPaths?.notFound ?? '/');
    });

    const beforeHookFn =
      config?.hooks?.onBeforeNavigate?.resolve?.bind(config?.hooks?.onBeforeNavigate) ??
      config?.hooks?.onBeforeNavigate ??
      ((router, route) => true);

    for (let i = 0; i < routes.length; ++i) {
      const route = routes[i];
      this.navigo.on(route.path, this.#handleNavigate.bind(this, route), {
        before: (done) => {
          let result = beforeHookFn(route, config);
          if (result instanceof Rxjs.Observable) {
            result = result.toPromise();
          } else if (!(result instanceof Promise)) {
            result = Promise.resolve(result);
          }

          result
            .then((x) => {
              if (typeof x !== 'boolean') {
                x = false;
              }

              done(x);
            })
            .catch(done);
        },
      });
    }

    this.navigo.resolve();
  }

  #handleNavigate(route, params) {
    this.currentRoute = route;
    this.#routeParams = params;
    this.events.next(route);
  }

  getRouteParams() {
    return this.#routeParams.data;
  }
}

export const routerService = new RouterService();
