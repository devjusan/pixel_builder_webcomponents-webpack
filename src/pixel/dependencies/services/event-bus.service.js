class EventBusService {
  constructor() {
    this.eventEmitter = new rxjs.Subject();
  }

  emit(key, payload) {
    this.eventEmitter.next({ key, payload });
  }

  on(...keys) {
    return this.eventEmitter.pipe(
      rxjs.operators.filter((x) => keys.includes(x.key)),
      rxjs.operators.map((x) => x.payload)
    );
  }
}

export default new EventBusService();
