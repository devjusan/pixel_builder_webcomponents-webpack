class RxMutationObserver {
  BASE_CFG = {
    attributes: true,
    attributeOldValue: true,
  };

  observeAttrs(el, attributeFilter) {
    const self = this;
    return new rxjs.Observable((subscriber) => {
      const cfg = attributeFilter?.length ? Object.assign({ attributeFilter }, self.BASE_CFG) : self.BASE_CFG;
      const mutationObserver = new MutationObserver((__mutations) => {
        const mutations = __mutations.filter((mutation) => mutation.type === 'attributes');
        if (mutations.length) subscriber.next(mutations);
      });

      mutationObserver.observe(el, cfg);

      subscriber.add(() => {
        mutationObserver.disconnect();
      });
    });
  }
}

class StylesController {
  static bind(id, stylesString) {
    if (!stylesString) return;

    let styleElement = document.head.querySelector(`style[data-for="${id}"]`);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.setAttribute('data-for', id);
      styleElement.innerText = stylesString;
      document.head.appendChild(styleElement);
      styleElement.componentCount = 1;
    } else {
      ++styleElement.componentCount;
    }
  }

  static unbind(id) {
    const styleElement = document.head.querySelector(`style[data-for="${id}"]`);
    if (styleElement) {
      --styleElement.componentCount;
      if (styleElement.componentCount <= 0) {
        styleElement.remove();
      }
    }
  }
}

export class WebComponent extends HTMLElement {
  static LifeCycleMap = {
    UNMOUNTED: 0,
    WILL_MOUNT: 1,
    MOUNTED: 2,
    WILL_UNMOUNT: 3,
  };

  get mounted() {
    return this.lifeCycle.getValue() === WebComponent.LifeCycleMap.MOUNTED;
  }

  get mounting() {
    return this.lifeCycle.getValue() === WebComponent.LifeCycleMap.WILL_MOUNT;
  }

  /**
   * @param  {string} templateString
   * @param  {string} stylesString=null
   * @param  {'open' | 'closed' | 'null'} shadowDom
   */
  constructor(templateString = null, stylesString = '', shadowDom = null, styleShadowDom = '') {
    super();
    this.lifeCycle = new rxjs.BehaviorSubject(WebComponent.LifeCycleMap.UNMOUNTED);

    this.__templateEl = $(templateString);
    this.__styles = stylesString;
    this.__stylesShadow = styleShadowDom;
    this.__shadowDom = shadowDom;
    this.__initialized = false;

    if (shadowDom === 'open') {
      this.attachShadow({
        mode: shadowDom,
      });
    } else if (shadowDom === 'closed') {
      this.shadowRoot = this.attachShadow({
        mode: shadowDom,
      });
    }
  }

  connectedCallback() {
    this.lifeCycle.next(WebComponent.LifeCycleMap.WILL_MOUNT);
    this.__ensureTemplateIfCan();
    this.__initializeIfCan();
    this.__observeAttributesIfCan();
    this.componentDidMountCaller();
    this.lifeCycle.next(WebComponent.LifeCycleMap.MOUNTED);
  }

  disconnectedCallback() {
    this.lifeCycle.next(WebComponent.LifeCycleMap.WILL_UNMOUNT);
    this.componentWillUnmountCaller();
    this.__removeTemplate();
    this.lifeCycle.next(WebComponent.LifeCycleMap.UNMOUNTED);
  }

  observeAttrsChanges(callback, whiteList) {
    return rxjs
      .merge(
        rxjs.of(
          whiteList?.length
            ? whiteList.map((attributeName) => ({
                attributeName,
                target: this,
              }))
            : Object.values(this.attributes).map((attr) => ({
                attributeName: attr.name,
                target: this,
              }))
        ),
        new RxMutationObserver()
          .observeAttrs(this, whiteList)
          .pipe(
            rxjs.operators.map((mutations) =>
              mutations.filter((mutation) => mutation.target.getAttribute(mutation.attributeName) !== mutation.oldValue)
            )
          )
      )
      .pipe(
        rxjs.operators.filter((mutations) => mutations.length),
        rxjs.operators.map((mutations) =>
          mutations.map((nextMutation) => ({
            attributeName: nextMutation.attributeName,
            newValue: nextMutation.target.getAttribute(nextMutation.attributeName),
            oldValue: nextMutation.oldValue,
          }))
        ),
        rxjs.operators.map((mutations) =>
          mutations.reduce((map, nextMutation) => {
            map[nextMutation.attributeName] = nextMutation;
            return map;
          }, {})
        ),
        this.takeUntilLifeCycle()
      )
      .subscribe(callback.bind(this));
  }

  __ensureTemplateIfCan() {
    if (this.__templateEl) this.__ensureTemplate();
  }

  __ensureTemplate() {
    const root = this.__shadowDom ? this.shadowRoot : this;

    StylesController.bind(this.nodeName, this.__styles);
    if (!this.__initialized && this.__shadowDom) this.__bindShadowRootStyles();

    this.__templateEl.appendTo(root);
  }

  __bindShadowRootStyles() {
    this.shadowRoot.innerHTML = `<style>${this.__stylesShadow}</style>`;
  }

  __initializeIfCan() {
    if (!this.__initialized) this.__initialize();
  }

  __initialize() {
    this.__initialized = true;
    this.onInitCaller();
  }

  __observeAttributesIfCan() {
    const observedAttrs = this.customObservedAttributes || this.constructor.customObservedAttributes;
    if (observedAttrs) this.__observeAttrs(observedAttrs);
  }

  __removeTemplate() {
    StylesController.unbind(this.nodeName);
    this.__templateEl?.detach();
    // this.__templateEl?.remove();
  }

  /**
   * @param  {string[]} whiteList
   */
  __observeAttrs(whiteList) {
    this.observeAttrsChanges(this.onAttributeChanges, whiteList);
  }

  onInitCaller() {
    this.onInit();
  }

  /**
   * Runs when component first mounts
   * @doc firstTimeConnectedCallback
   */
  onInit() {}

  componentDidMountCaller() {
    this.componentDidMount();
  }

  /**
   * Runs when component mount
   * @doc connectedCallback
   */
  componentDidMount() {}

  /**
   * Runs when customObservedAttributes changes
   * @param {{[attribute: string]: {oldValue: string; newValue: string;}}} changes
   */
  onAttributeChanges(changes) {}

  componentWillUnmountCaller() {
    this.componentWillUnmount();
  }

  /**
   * Runs when component unmount from dom
   * @doc disconnectedCallback
   */
  componentWillUnmount() {}

  /**
   * @param {rxjs.Subscription | (() => void) | Array<rxjs.Subscription | (() => void)>} taskOrTasks
   *
   * @returns {rxjs.Subscription}
   */
  registerOnUnmount(taskOrTasks) {
    if (!Array.isArray(taskOrTasks)) {
      taskOrTasks = [taskOrTasks];
    }

    return this.lifeCycle
      .pipe(
        rxjs.operators.first(
          (lifeCycle) =>
            lifeCycle === WebComponent.LifeCycleMap.WILL_UNMOUNT || lifeCycle === WebComponent.LifeCycleMap.UNMOUNTED
        )
      )
      .subscribe(() => {
        for (const aux of taskOrTasks) {
          if (typeof aux === 'function') {
            aux();
          } else {
            aux?.unsubscribe?.();
          }
        }
      });
  }

  /**
   * @template T
   *
   * @returns {rxjs.MonoTypeOperatorFunction<T>}
   */
  takeUntilLifeCycle() {
    return rxjs.operators.takeUntil(
      this.lifeCycle.pipe(
        rxjs.operators.first(
          (lifeCycle) =>
            lifeCycle === WebComponent.LifeCycleMap.WILL_UNMOUNT || lifeCycle === WebComponent.LifeCycleMap.UNMOUNTED
        )
      )
    );
  }

  get onWillMountObservable() {
    return this.#getGivenLcObservable(WebComponent.LifeCycleMap.WILL_MOUNT);
  }

  get onMountObservable() {
    return this.#getGivenLcObservable(WebComponent.LifeCycleMap.MOUNTED);
  }

  get onWillUnmountObservable() {
    return this.#getGivenLcObservable(WebComponent.LifeCycleMap.WILL_UNMOUNT);
  }

  get onUnmountObservable() {
    return this.#getGivenLcObservable(WebComponent.LifeCycleMap.UNMOUNTED);
  }

  #getGivenLcObservable = (lC) =>
    this.lifeCycle.pipe(
      rxjs.operators.filter((__lC) => __lC === lC),
      rxjs.operators.map(() => this)
    );
}
