import { WebComponent } from '../../libs/at/core/index.js';

class useState {
  /** @type {any} */
  state;
  /** @type {(state) => any} */
  setState;
  /** @type {WebComponent} */
  #contextEl;

  /**
   * @param {T} initialState
   * @param {WebComponent} contextEl
   * @template T
   */
  constructor(initialState, contextEl) {
    if (!contextEl) {
      throw new Error('Context element is required');
    }

    this.state = initialState;
    this.setState = this.#handleSetState.bind(this);
    this.#contextEl = contextEl;
  }

  /**
   * @param {T} newState
   * @template T
   */
  #handleSetState(newState) {
    if (typeof newState === 'function') {
      this.state = newState(this.state);
    } else {
      this.state = newState;
    }

    this.#rerender();
  }

  #rerender() {
    this.#contextEl.connectedCallback();
  }
}

export default useState;
