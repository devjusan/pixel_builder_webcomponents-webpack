import { WithStackNavigator, StackNavigatorScreen } from '../adapters/index.js';
import * as Rxjs from 'rxjs';

class StackParentScreen {
  ClassNames = {
    STACK_NAVIGATOR_PARENT: 'stack-navigator-parent',
  };

  /**  @param {HTMLElement} element */
  constructor(element) {
    this.element = element;
    this.width = element.clientWidth;
    this.height = element.clientHeight;

    element.classList.add(this.ClassNames.STACK_NAVIGATOR_PARENT);
    element.innerHTML = '';
  }
}

class StackScreen {
  ClassNames = {
    STACK_NAVIGATOR_ITEM: 'stack-navigator-item',
  };

  /**
   * @param {{screenEl: HTMLElement | StackNavigatorScreen, name: string; payload: any;}} screenConfig
   * */
  constructor(screenConfig) {
    this.name = screenConfig.name;
    this.screenEl = screenConfig.screenEl;
    this.payload = screenConfig.payload;
    this.screenWrapperEl = this.#getScreenWrapper(this.screenEl);
  }

  #getScreenWrapper(screenEl) {
    const screenWrapperEl = document.createElement('div');

    screenWrapperEl.classList.add(this.ClassNames.STACK_NAVIGATOR_ITEM);
    screenWrapperEl.append(screenEl);

    return screenWrapperEl;
  }
}

class ScreensLogTuple extends Array {
  /**
   * @param  {StackScreen} screen
   */
  push(screen) {
    super.push(screen);

    if (this.length > 2) {
      this.shift();
    }
  }

  /**
   * @param  {StackScreen} screen
   */
  ensure(screen) {
    if (!this.includes(screen)) {
      this.push(screen);
    }
  }

  isFull() {
    return this.length === 2;
  }

  clear() {
    this.length = 0;
  }
}

export default class StackNavigator {
  ClassNames = {
    ROUGH_TRANSITION: 'build-heap',
    ROUGH_TRANSITION_EXCEPTION: 'build-heap-exception',
  };

  #stackParent;
  #parentResizeObserver;
  #stack;
  #activePageIndex;
  #activeScreenLogTuple;

  get stack() {
    return this.#stack;
  }

  /**
   * @param {HTMLElement} parentElement
   * @param {{screenEl: HTMLElement | StackNavigatorScreen, name: string, payload: any;}[]} stackConfigs
   * @param {string|undefined} initialPageName
   * @param {boolean} isLazyMounted
   */
  constructor(parentElement, stackConfigs, initialPageName, isLazyMounted) {
    this.#stackParent = new StackParentScreen(parentElement);
    this.#parentResizeObserver = new ResizeObserver(this.#watchParentSizeChanges.bind(this));
    this.#activeScreenLogTuple = new ScreensLogTuple();
    this.#stack = stackConfigs.map((cfg) => new StackScreen(cfg));
    this.#activePageIndex = Math.max(
      this.#stack.findIndex((stackScreen) => stackScreen.name === initialPageName),
      0
    );
    this.activePageSubject = new Rxjs.BehaviorSubject(this.#stack[this.#activePageIndex]);

    this.#onPrepare(isLazyMounted);
  }

  #onPrepare(isLazyMounted) {
    this.#syncDom();
    this.#connectAllElements(this.#stack.map(({ screenEl }) => screenEl));
    if (!isLazyMounted) this.mount();
  }

  mount() {
    this.#navigateInLifeCycle(this.latestPageParams);
    this.#syncView();
    this.#parentResizeObserver.observe(this.#stackParent.element);
  }

  unmount() {
    this.#navigateOutLifeCycle();
    this.#syncView();
    this.#parentResizeObserver.disconnect();
  }

  destroy() {
    this.unmount();
    this.#stackParent = null;
  }

  #connectAllElements(elements) {
    for (let i = 0, element; i < elements.length; i++) {
      element = elements[i];

      if (element instanceof WithStackNavigator) {
        element.subscribeActions({
          navigate: this.handleNavigate.bind(this),
          goBack: this.goToFirstPage.bind(this),
        });
      }
      this.#connectAllElements(element.children);
    }
  }

  setStack(cb) {
    this.unmount();

    const [stackScreenOrStackCfg, activePageIndex] = cb(this.#stack, this.#activePageIndex);
    this.#stack = stackScreenOrStackCfg.map((configOrScreen) => {
      if (configOrScreen instanceof StackScreen) return configOrScreen;
      else return new StackScreen(configOrScreen);
    });
    this.#activePageIndex = Math.min(activePageIndex, this.#stack.length - 1);
    this.activePageSubject.next(this.#stack[this.#activePageIndex]);
    this.#activeScreenLogTuple.clear();
    this.#onPrepare();
    this.#syncDom();
    this.#syncView();
  }

  removePageByIndex(index) {
    this.unmount();

    this.#stack.splice(index, 1);
    this.#activePageIndex = Math.min(this.#activePageIndex, this.#stack.length - 1);
    this.activePageSubject.next(this.#stack[this.#activePageIndex]);
    this.#activeScreenLogTuple.clear();
    this.#syncDom();
    this.#syncView();
  }

  #syncDom() {
    this.#removeLeftWrappersEls();
    this.#addMissingWrappersEls();
  }

  #removeLeftWrappersEls() {
    Array.from(this.#stackParent.element.children)
      .filter((screenWrapperEl) => !this.#stack.find((stackItem) => stackItem.screenWrapperEl === screenWrapperEl))
      .forEach((el) => {
        el.remove();
      });
  }

  #addMissingWrappersEls() {
    const stackWrapperEls = Array.from(this.#stackParent.element.children);

    this.#stack.forEach((stackScreen, i) => {
      if (!stackWrapperEls.includes(stackScreen.screenWrapperEl)) {
        const position = Math.min(this.#stackParent.element.children.length, i);

        this.#stackParent.element.insertBefore(
          stackScreen.screenWrapperEl,
          this.#stackParent.element.children[position]
        );
      }
    });
  }

  handleNavigate(routeName, params) {
    const newPageIndex = this.#stack.findIndex(({ name }) => name === routeName);

    if (newPageIndex === -1 || newPageIndex === this.#activePageIndex) return;

    this.#navigateOutLifeCycle();

    this.#activePageIndex = newPageIndex;
    this.activePageSubject.next(this.#stack[this.#activePageIndex]);
    this.latestPageParams = params;

    this.#navigateInLifeCycle(params);
    this.#syncView();
  }

  goToFirstPage() {
    this.#navigateOutLifeCycle();

    this.#activePageIndex = _.clamp(0, this.#activePageIndex - 1);

    this.activePageSubject.next(this.#stack[this.#activePageIndex]);

    this.#navigateInLifeCycle();
    this.#syncView();
  }

  nextPage() {
    this.#navigateOutLifeCycle();

    this.#activePageIndex = _.clamp(this.#activePageIndex + 1, 0, this.#stack.length - 1);
    this.activePageSubject.next(this.#stack[this.#activePageIndex]);

    this.#navigateInLifeCycle();
    this.#syncView();
  }

  previousPage() {
    this.#navigateOutLifeCycle();

    this.#activePageIndex = _.clamp(this.#activePageIndex - 1, 0, this.#stack.length - 1);
    this.activePageSubject.next(this.#stack[this.#activePageIndex]);

    this.#navigateInLifeCycle();
    this.#syncView();
  }

  getCurrentView() {
    return this.#stack[this.#activePageIndex];
  }

  getActivePageObservable() {
    if (!this.activePageObservable) {
      this.activePageObservable = this.activePageSubject.asObservable();
    }

    return this.activePageObservable;
  }

  #syncView() {
    const activeScreen = this.getCurrentView();

    if (this.#activeScreenLogTuple.isFull()) {
      const screen = this.#activeScreenLogTuple.shift();
      screen.screenWrapperEl.classList.remove(this.ClassNames.ROUGH_TRANSITION_EXCEPTION);
    }

    this.#activeScreenLogTuple.ensure(activeScreen);
    this.#removeLeftClassesWithTransition();
    this.#buildHeap();
  }

  #buildHeap() {
    let displacement;
    this.#stack.forEach((stackScreen, i) => {
      if (i < this.#activePageIndex) displacement = this.#getLeftDisplacement(i);
      else if (i > this.#activePageIndex) displacement = this.#getRightDisplacement(i);
      else displacement = this.#getCenterDisplacement(i);

      stackScreen.screenWrapperEl.style.setProperty('transform', `translateX(${displacement})`);

      this.#bindRoughTransitions(stackScreen.screenWrapperEl);
    });
  }

  #getCenterDisplacement = (position) => `-${position * 100}%`;
  #getLeftDisplacement = (position) => this.#getCenterDisplacement(position + 1);
  #getRightDisplacement = (position) => this.#getCenterDisplacement(position - 1);

  #bindRoughTransitions(screenWrapperEl) {
    screenWrapperEl.classList.add(this.ClassNames.ROUGH_TRANSITION);
    screenWrapperEl.addEventListener(
      'transitionend',
      () => screenWrapperEl.classList.remove(this.ClassNames.ROUGH_TRANSITION),
      {
        once: true,
      }
    );
  }

  #removeLeftClassesWithTransition() {
    this.#stack.forEach((stackScreen) => {
      const activeScreen = this.getCurrentView();

      if (
        stackScreen.screenWrapperEl.classList.contains(this.ClassNames.ROUGH_TRANSITION_EXCEPTION) &&
        activeScreen.name !== stackScreen.name
      ) {
        setTimeout(() => {
          stackScreen.screenWrapperEl.classList.remove(this.ClassNames.ROUGH_TRANSITION_EXCEPTION);
        }, 400);
      } else {
        activeScreen.screenWrapperEl.classList.add(this.ClassNames.ROUGH_TRANSITION_EXCEPTION);
      }
    });
  }

  #navigateInLifeCycle(params) {
    if (this.getCurrentView()?.screenEl instanceof StackNavigatorScreen) {
      this.getCurrentView().screenEl.onNavigateIn(params);
    }
  }

  #navigateOutLifeCycle() {
    if (this.getCurrentView()?.screenEl instanceof StackNavigatorScreen) {
      this.getCurrentView().screenEl.onNavigateOut();
    }
  }

  #watchParentSizeChanges([entry]) {
    const { width, height } = entry.contentRect;

    this.#stackParent.width = width;
    this.#stackParent.height = height;

    this.#refreshSizes();
  }

  #refreshSizes() {
    const { width, height } = this.#stackParent;

    this.#stack.forEach(({ screenWrapperEl }) => {
      screenWrapperEl.style.width = `${width}px`;
      screenWrapperEl.style.height = `${height}px`;
    });
  }
}
