import { HandlersFactory } from '../index.js';

export default class Modals {
  /** @typedef {Object.<string, { makeView: () => HTMLElement; isActionRequired: boolean; }>} ModalsState */
  /** @typedef {{view: HTMLElement; payload?: Object.<string, any>; isActionRequired?: boolean}} ActiveModal */

  #modalsFactory;
  #modalsEntries;
  /**@type {ActiveModal[]} */
  #modals;

  /**
   * @param  {ModalsState} modalsState
   */
  constructor(modalsState) {
    this.#modals = [];
    this.#modalsEntries = Object.entries(modalsState).reduce((modalsCfg, nextModal) => {
      const [key, nextModalCfg] = nextModal;
      const { makeView, isActionRequired } = nextModalCfg;

      modalsCfg[key] = () => ({
        view: makeView(),
        isActionRequired,
      });

      return modalsCfg;
    }, {});
    this.#modalsFactory = new HandlersFactory(this.#modalsEntries);
  }

  push(modalName, payload = {}) {
    const baseModalSettings = this.#modalsFactory.getHandler(modalName)();
    const modalSettings = Object.assign(baseModalSettings, { payload });

    this.#modals.push(modalSettings);

    return modalSettings;
  }

  pop() {
    return this.#modals.pop();
  }

  /**
   * @param  {ModalsState} cfg
   * @returns {Modals}
   */
  addEntry(cfg) {
    this.#modalsEntries = Object.assign(this.#modalsEntries, cfg);

    return this.#modalsEntries;
  }

  /**
   * @returns {Modals}
   */
  modalsEntries() {
    return this.#modalsEntries;
  }
}
