import { Pixel } from '../index.js';

class ActualPixelService {
  #actual;
  constructor() {
    this.#actual = new rxjs.BehaviorSubject(null);
  }

  getActual() {
    return this.#actual.asObservable();
  }

  /** @param {{pixelJson: Pixel}} actual */
  setActual(actual) {
    this.#actual.next(actual);
  }
}

export default new ActualPixelService();
