class PixelTokenService {
  constructor() {
    this.token = null;
    this.tokenSubject = new rxjs.BehaviorSubject(this.token);
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
      throw new Error("Token is not set");
    }

    return this.token;
  }

  getTokenObservable() {
    return this.tokenSubject.asObservable().pipe(
      rxjs.operatores.tap((token) => {
        if (!token) {
          return rxjs.throwError("Token is not set");
        }
      }),
      operators.distinctUntilChanged(),
      operators.shareReplay(1)
    );
  }

  #notify() {
    this.tokenSubject.next(this.token);
  }
}

export default new PixelTokenService();
