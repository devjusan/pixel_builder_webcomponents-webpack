import * as Rxjs from 'rxjs';

class EventBusService {
  constructor() {
    this.eventEmitter = new Rxjs.Subject();
  }

  emit(key, payload) {
    this.eventEmitter.next({ key, payload });
  }

  on(...keys) {
    return this.eventEmitter.pipe(
      Rxjs.filter((x) => keys.includes(x.key)),
      Rxjs.map((x) => x.payload)
    );
  }
}

export default new EventBusService();
