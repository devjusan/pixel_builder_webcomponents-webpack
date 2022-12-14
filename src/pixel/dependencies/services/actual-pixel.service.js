import { Pixel } from '../index.js';
import * as Rxjs from 'rxjs';

class ActualPixelService {
  #actual;
  constructor() {
    this.#actual = new Rxjs.BehaviorSubject(null);
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
