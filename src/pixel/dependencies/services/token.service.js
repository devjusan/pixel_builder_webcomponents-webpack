import * as Rxjs from 'rxjs';

class PixelTokenService {
  constructor() {
    this.token = null;
    this.tokenSubject = new Rxjs.BehaviorSubject(this.token);
  }

  /**
   * @param {string} token
   */
  setToken(token) {
    this.token = token;
    this.#notify();
  }

  getToken() {
    if (!this.token) {
      throw new Error('Token is not set');
    }

    return this.token;
  }

  getTokenObservable() {
    return this.tokenSubject.asObservable().pipe(
      Rxjs.tap((token) => {
        if (!token) {
          return Rxjs.throwError(() => Error('Token is not set'));
        }
      }),
      Rxjs.distinctUntilChanged(),
      Rxjs.shareReplay(1)
    );
  }

  #notify() {
    this.tokenSubject.next(this.token);
  }
}

export default new PixelTokenService();
