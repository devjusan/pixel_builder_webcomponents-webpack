class HandlersFactory {
  /** @typedef {{[any:string]:(args:any) => any}} IHandlersFactory */

  /**@type {IHandlersFactory} */
  #factory = {};

  /** @param {IHandlersFactory} factory */
  constructor(factory) {
    this.#factory = factory;
  }

  getHandler(key) {
    return this.#factory[key] ?? this.#couldntFindHandlerCb;
  }

  #couldntFindHandlerCb = () => console.warn('Unregistered factory handler');
}

class AdvancedHandlersFactory {
  /** @typedef {Array<AdvancedHandlersFactoryEntry>} IAdvancedHandlersFactory */
  /** @typedef {{[x: string]: any}} IChangesMap */

  /**
   * @param {ctx} any
   * @param  {IAdvancedHandlersFactory} factory
   */
  constructor(ctx, factory) {
    this.ctxRef = new WeakRef(ctx ?? this);
    this.weakMap = new WeakMap([
      [
        this.ctxRef.deref(),
        factory.reduce((acc, { keyOrKeys, handler }) => {
          if (ctx) handler = handler.bind(ctx);

          (Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]).forEach((v) => {
            acc[v] = handler;
          });

          return acc;
        }, {}),
      ],
    ]);
  }

  getHandler(key) {
    return this.weakMap.get(this.ctxRef.deref())[key] ?? this.#couldntFindHandlerCb;
  }

  keys() {
    return Object.keys(this.weakMap.get(this.ctxRef.deref()));
  }

  /** @param {IChangesMap} changesMap */
  resolve(changesMap) {
    const taskMap = Object.entries(changesMap).reduce((map, [key, value]) => {
      const handler = this.getHandler(key);
      let valueObject;

      if (!map.has(handler)) {
        valueObject = {};
        map.set(handler, valueObject);
      } else {
        valueObject = map.get(handler);
      }

      valueObject[key] = value;

      return map;
    }, new Map());

    for (const [task, value] of taskMap.entries()) {
      task(value);
    }
  }

  #couldntFindHandlerCb = () => console.warn('Unregistered factory handler');
}

class AdvancedHandlersFactoryEntry {
  /**
   * @param  {string|string[]} keyOrKeys
   * @param  {()=>{}} handler
   */
  constructor(keyOrKeys, handler) {
    this.keyOrKeys = keyOrKeys;
    this.handler = handler;
  }
}

export { HandlersFactory, AdvancedHandlersFactory, AdvancedHandlersFactoryEntry };
