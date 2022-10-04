import { WebComponent } from '../../libs/at/core/index.js';

class WithStackNavigator extends WebComponent {
  /**
   * @param {{navigate: (routeName: string, params: any) => void; goBack: () => void}} navigate
   */
  subscribeActions(navigate) {
    this.navigator = navigate;
  }
}

class StackNavigatorScreen extends WithStackNavigator {
  onNavigateIn(params) {
    this.routeWillNavigateIn?.(params);
  }

  onNavigateOut() {
    this.routeWillNavigateOut?.();
  }
}

export { WithStackNavigator, StackNavigatorScreen };
