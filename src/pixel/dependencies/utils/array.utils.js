/**
 * @template T
 * @typedef {(item: T, index: number) => string} KeyExtractor<T>
 */

/**
 * @template T
 * @param {T} item
 *
 * @returns {T}
 */
function sameFn(item) {
  return item;
}

/**
 * @template T
 * @typedef ChangesLike<T>
 * @property {Array<T>} adds
 * @property {Array<T>} updates
 */

/**
 * @template T
 * @typedef EditsResultLike<T>
 * @property {Array<T>} adds
 * @property {Array<T>} updates
 * @property {Array<T>} deletes
 */

export class ArrayUtils {
  /**
   * @template T
   * @param {Array<T>} array
   * @param {Array<T>} items
   * @param {KeyExtractor<T>} keyExtractor
   * @param {(newItem: any, oldItem: any) => any} updater
   * @param {(newItem: any, oldItem: any) => boolean} canUpdateFn
   * @returns {ChangesLike<T>}
   */
  static addOrUpdateRange(array, items, keyExtractor, updater, canUpdateFn) {
    const { adds, updates } = ArrayUtils.applyEdits(
      array,
      { adds: items, updates: items },
      keyExtractor,
      updater,
      canUpdateFn
    );

    return { adds, updates };
  }

  /**
   * @template T
   * @param {Array<T>} items
   * @param {T} item
   * @param {KeyExtractor<T>} [keyExtractor]
   *
   * @returns {boolean}
   */
  static removeItem(items, item, keyExtractor) {
    const results = ArrayUtils.removeItems(items, [item], keyExtractor);
    return results.length > 0;
  }

  /**
   * @template T
   * @param {Array<T>} items
   * @param {Array<T>} itemsToRemoved
   * @param {KeyExtractor<T>} [keyExtractor]
   *
   * @returns {Array<T>}
   */
  static removeItems(items, itemsToRemoved, keyExtractor) {
    if (!keyExtractor) {
      keyExtractor = (x) => x;
    }

    return ArrayUtils.removeItemsByKeys(
      items,
      itemsToRemoved.map((item) => keyExtractor(item)),
      keyExtractor
    );
  }

  /**
   * @template T
   * @param {Array<T>} items
   * @param {string} key
   * @param {KeyExtractor<T>} keyExtractor
   *
   * @returns {Array<T>}
   */
  static removeItemsByKey(items, key, keyExtractor) {
    return ArrayUtils.removeItemsByKeys(items, [key], keyExtractor);
  }

  /**
   * @template T
   * @param {Array<T>} items
   * @param {Array<string>} keysToRemoved
   * @param {KeyExtractor<T>} keyExtractor
   *
   * @returns {Array<T>}
   */
  static removeItemsByKeys(items, keysToRemoved, keyExtractor) {
    if (!keyExtractor) {
      keyExtractor = (x) => x;
    }

    const keySet = keysToRemoved.reduce((acc, key) => {
      acc.add(key);
      return acc;
    }, new Set());
    const results = _.remove(items, (x) => keySet.has(keyExtractor(x)));
    return results;
  }

  /**
   * @template T
   * @param {Array<T>} items
   * @param {{adds: Array<T>, updates: Array<T>, deletes: Array<string>}} edits
   * @param {KeyExtractor<T>} [keyExtractor]
   * @param {(newItem: any, oldItem: any) => any} [updater]
   * @param {(newItem: any, oldItem: any) => boolean} [canUpdateFn]
   *
   * @returns {EditsResultLike<T>}
   */
  static applyEdits(items, edits, keyExtractor, updater, canUpdateFn) {
    if (!keyExtractor) {
      keyExtractor = sameFn;
    }

    let adds = ArrayUtils.uniqBy(
      edits?.adds?.map((item) => {
        return { key: keyExtractor(item), item };
      }),
      (x) => x.key
    );
    let updates = edits?.updates?.map((item) => {
      return { key: keyExtractor(item), item };
    });
    let deleteKeys = edits?.deletes;

    /**
     * @type {Array<T>}
     */
    let deletedItems;

    if (deleteKeys?.length) {
      deletedItems = ArrayUtils.removeItemsByKeys(items, deleteKeys, keyExtractor);
    }

    const itemsKeyedMap = !(updates?.length || adds?.length)
      ? null
      : items.reduce((acc, item, index) => {
          acc.set(keyExtractor(item, index), { item, index });
          return acc;
        }, new Map());

    let itemsUpdated;

    if (updates?.length) {
      updater = updater ?? sameFn;
      canUpdateFn = canUpdateFn ?? (() => true);

      const itemsUpdatedKeyedMap = new Map();

      let newItemKeyed;
      let itemKeyed;
      let item;
      for (let i = 0; i < updates.length; ++i) {
        newItemKeyed = updates[i];
        itemKeyed = itemsKeyedMap.get(newItemKeyed.key);
        if (itemKeyed && canUpdateFn(newItemKeyed.item, itemKeyed.item)) {
          item = updater(newItemKeyed.item, itemKeyed.item);
          items[itemKeyed.index] = item;
          itemKeyed.item = item;

          itemsUpdatedKeyedMap.set(newItemKeyed.key, item);
        }
      }

      itemsUpdated = Array.from(itemsUpdatedKeyedMap, ([, item]) => item);
    }

    if (adds?.length) {
      adds = adds.filter((x) => !itemsKeyedMap.has(x.key)).map((x) => x.item);
      Array.prototype.push.apply(items, adds);
    }

    return { adds, updates: itemsUpdated ?? [], deletes: deletedItems ?? [] };
  }

  /**
   * @template T
   * @param {Array<T>} items
   * @param {KeyExtractor<T>} [keyExtractor]
   *
   * @returns {Array<T>}
   */
  static uniqBy(items, keyExtractor) {
    if (items) {
      keyExtractor = keyExtractor ?? sameFn;

      const auxMap = new Map();

      let key;
      let item;
      for (let i = 0; i < items.length; ++i) {
        item = items[i];
        key = keyExtractor(item);

        auxMap.set(key, item);
      }

      return Array.from(auxMap, ([, value]) => value);
    } else {
      return null;
    }
  }

  /**
   * @param {Array<T>} array
   * @param {number} key
   *
   * @returns {Array<Array<T>>}
   */
  static orderByKey(array, key) {
    return array?.sort((a, b) => {
      if (typeof a[key] === 'string' && typeof b[key] === 'string') {
        return a[key].localeCompare(b[key]);
      }

      if (a[key] > b[key]) {
        return -1;
      } else if (a[key] < b[key]) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  /**
   * @param {Array<T>} array
   * @param {number} size
   *
   * @returns {Array<Array<T>>}
   */
  static chunk(array, size) {
    return new Array(Math.ceil(array.length / size)).fill().map((_) => array.splice(0, size));
  }

  /**
   * @param {Array<T>} array
   * @param {number} size
   *
   * @returns {Array<T>}
   */
  static cut(array, size) {
    return array.slice(0, size);
  }
}
