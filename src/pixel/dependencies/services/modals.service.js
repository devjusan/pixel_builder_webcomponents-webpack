import { Modals } from '../domain/models/pixel/helpers/index.js';
import * as Rxjs from 'rxjs';
class ModalsService {
  /** @type {Modals[]} */
  #state;

  constructor() {
    this.#state = new Modals({
      'widget-stage': {
        isActionRequired: true,
        makeView: () => document.createElement('widget-stage'),
      },
      'map-component-helper': {
        isActionRequired: false,
        makeView: () => document.createElement('app-map-component-helper'),
      },
    });

    this.onPushModal = new Rxjs.Subject();
    this.onPopModal = new Rxjs.Subject();
  }

  /**
   * @param {string} view
   * @param {any} payload
   */
  open(view, payload) {
    const modalSettings = this.#state.push(view, payload);
    this.onPushModal.next(modalSettings);
  }

  close() {
    const modalSettings = this.#state.pop();

    if (modalSettings) this.onPopModal.next(modalSettings);
  }

  getPushModalObservable() {
    if (!this.pushModalObservable) {
      this.pushModalObservable = this.onPushModal.asObservable();
    }

    return this.pushModalObservable;
  }

  getPopModalObservable() {
    if (!this.popModalObservable) {
      this.popModalObservable = this.onPopModal.asObservable();
    }

    return this.popModalObservable;
  }
}

export default new ModalsService();
