import { WebComponent } from '../../libs/at/core/index.js';

export default class ModalAdapter extends WebComponent {
  /** @type {boolean} */
  #isActionRequired;

  set isActionRequired(isActionRequired) {
    this.#isActionRequired = isActionRequired;
  }

  get isActionRequired() {
    return this.#isActionRequired;
  }

  setPayload(payload) {
    this.payload = payload;
  }

  /**
   * @param  {()=>void} closeFn
   */
  subscribeCloseModalFn(closeFn) {
    this.closeModal = closeFn;
  }
}
