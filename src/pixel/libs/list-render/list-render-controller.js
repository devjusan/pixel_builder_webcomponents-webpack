import { scheduleAsync, scheduleDelayAsync, scheduleAnimationFrameAsync } from './schedule.js';
import { TaskManager, TaskOperation } from './task-manager.js';
import * as Rxjs from 'rxjs';

/**
 * @typedef {HTMLElement | SVGAElement} El
 * @typedef {void | (() => any) | Rxjs.Subscription | Array<(() => any) | Rxjs.Subscription>} EventBinded
 *
 * @typedef {(item: any, index: number) => string} KeyExtractor
 *
 * @typedef {(item: any, key: string, index: number) => El} ItemCreator
 * @typedef {(itemEl: El, item: any, key: string, index: number) => EventBinded} OnBindItem
 *
 * @typedef {(itemEl: El, item: any, key: string, index: number) => El} ContainerItemCreator
 * @typedef {(containerItemEl: El, itemEl: El, item: any, key: string, index: number) => EventBinded} OnBindContainerItem
 *
 */

export class ListRenderControllerBuilder {
  /**
   * @param {Element} [containerEl]
   */
  constructor(containerEl) {
    this.withTarget(containerEl);
  }

  /**
   * @param {Element} containerEl
   *
   * @returns {this}
   */
  withTarget(containerEl) {
    this.containerEl = containerEl;
    return this;
  }

  /**
   * @param {any} contextId
   *
   * @returns {this}
   */
  withContextId(contextId) {
    this.contextId = contextId;
    return this;
  }

  /**
   * @param {KeyExtractor} keyExtractor
   *
   * @returns {this}
   */
  withKeyExtractor(keyExtractor) {
    this.keyExtractor = keyExtractor;
    return this;
  }

  /**
   * @param {ContainerItemCreator} containerItemCreator
   *
   * @returns {this}
   */
  withContainerCreator(containerItemCreator) {
    this.containerItemCreator = containerItemCreator;
    return this;
  }

  /**
   * @param {OnBindContainerItem} onBindContainerItem
   *
   * @returns {this}
   */
  withOnBindContainerItem(onBindContainerItem) {
    this.onBindContainerItem = onBindContainerItem;
    return this;
  }

  /**
   * @param {OnBindContainerItem} onAfterBindContainerItem
   *
   * @returns {this}
   */
  withOnAfterBindContainerItem(onAfterBindContainerItem) {
    this.onAfterBindContainerItem = onAfterBindContainerItem;
    return this;
  }

  withEmptyItemCreator() {
    return this.withItemCreator(() => {});
  }

  /**
   * @param {ItemCreator} itemCreator
   *
   * @returns {this}
   */
  withItemCreator(itemCreator) {
    this.itemCreator = itemCreator;
    return this;
  }

  /**
   * @param {OnBindItem} onBindItem
   *
   * @returns {this}
   */
  withOnBindItem(onBindItem) {
    this.onBindItem = onBindItem;
    return this;
  }

  /**
   * @param {OnBindItem} onAfterBindItem
   *
   * @returns {this}
   */
  withOnAfterBindItem(onAfterBindItem) {
    this.onAfterBindItem = onAfterBindItem;
    return this;
  }

  build() {
    const renderAdapter = new HTMLElementRenderAdapter(
      String(this.contextId ?? Math.random().toString('16').substr(2)),
      this.containerEl,
      this.keyExtractor,
      this.containerItemCreator,
      this.onBindContainerItem,
      this.onAfterBindContainerItem,
      this.itemCreator,
      this.onBindItem,
      this.onAfterBindItem
    );
    return new ListRenderController(renderAdapter);
  }
}

class HTMLElementRenderAdapter {
  /**
   * @type {string}
   */
  contextId;

  /**
   * @type {El}
   */
  get containerEl() {
    return this.containerElRef?.deref();
  }

  /**
   * @type {KeyExtractor}
   */
  keyExtractor;

  /**
   * @type {ContainerItemCreator}
   */
  containerItemCreator;

  /**
   * @type {OnBindContainerItem}
   */
  onBindContainerItem;

  /**
   * @type {OnBindContainerItem}
   */
  onAfterBindContainerItem;

  /**
   * @type {ItemCreator}
   */
  itemCreator;

  /**
   * @type {OnBindItem}
   */
  onBindItem;

  /**
   * @type {OnBindItem}
   */
  onAfterBindItem;

  /**
   * @param {string} contextId
   * @param {El} containerEl
   * @param {KeyExtractor} keyExtractor
   * @param {ContainerItemCreator} containerItemCreator
   * @param {OnBindContainerItem} onBindContainerItem
   * @param {OnBindContainerItem} onAfterBindContainerItem
   * @param {ItemCreator} itemCreator
   * @param {OnBindItem} onBindItem
   * @param {OnBindItem} onAfterBindItem
   */
  constructor(
    contextId,
    containerEl,
    keyExtractor,
    containerItemCreator,
    onBindContainerItem,
    onAfterBindContainerItem,
    itemCreator,
    onBindItem,
    onAfterBindItem
  ) {
    this.contextId = contextId;

    this.containerElRef = new WeakRef(containerEl);
    this.keyExtractor =
      keyExtractor ??
      ((item, index) => {
        return index;
      });
    this.containerItemCreator = containerItemCreator ?? ((itemEl) => itemEl);
    this.onBindContainerItem = onBindContainerItem;
    this.onAfterBindContainerItem = onAfterBindContainerItem;
    this.itemCreator =
      itemCreator ??
      ((item, key) => {
        return $(`<div>${JSON.stringify(item)}</div>`)[0];
      });
    this.onBindItem = onBindItem;
    this.onAfterBindItem = onAfterBindItem;

    this.contextKeyAttr = 'data-context-key';
    this.itemKeyAttr = 'data-item-key';
    this.containerItemKeyAttr = 'data-container-item-key';
  }

  count() {
    return this.containerEl.children.length;
  }

  listContainerItemEl() {
    return Array.from(this.containerEl.children);
  }

  extractKeyFromEl(el) {
    return el.getAttribute(this.containerItemKeyAttr) || el.getAttribute(this.itemKeyAttr);
  }

  extractContextKeyFromEl(el) {
    return el.getAttribute(this.contextKeyAttr);
  }

  getIndexByKey(key) {
    return Array.prototype.findIndex.call(this.containerEl.children, (el) => {
      const contextId = this.extractContextKeyFromEl(el);
      if (contextId !== this.contextId) {
        return false;
      }

      const keyAux = this.extractKeyFromEl(el);
      return key === keyAux;
    });
  }

  findContainerItemElByKey(key) {
    const itemEl = this.containerEl.querySelector(
      `[${this.containerItemKeyAttr}="${key}"][${this.contextKeyAttr}="${this.contextId}"]`
    );
    return itemEl;
  }

  findItemElByKey(key) {
    const itemEl = this.containerEl.querySelector(
      `[${this.itemKeyAttr}="${key}"][${this.contextKeyAttr}="${this.contextId}"]`
    );
    return itemEl;
  }

  removeElByKey(key) {
    const itemEl = this.findContainerItemElByKey(key);
    this.removeEl(itemEl);
  }

  removeEl(itemEl) {
    itemEl?.remove();
  }

  extractKey(item, index) {
    return String(this.keyExtractor(item, index));
  }

  createItemEl(item, key, index) {
    const itemEl = this.itemCreator(item, key, index);
    itemEl?.setAttribute(this.itemKeyAttr, key);
    itemEl?.setAttribute(this.contextKeyAttr, this.contextId);
    return itemEl;
  }

  bindItemEl(itemEl, item, key, index) {
    return this.onBindItem?.(itemEl, item, key, index);
  }

  afterBindItemEl(itemEl, item, key, index) {
    return this.onAfterBindItem?.(itemEl, item, key, index);
  }

  createContainerItemEl(itemEl, item, key, index) {
    const containerItemEl = this.containerItemCreator?.(itemEl, item, key, index);
    containerItemEl?.setAttribute(this.containerItemKeyAttr, key);
    containerItemEl?.setAttribute(this.contextKeyAttr, this.contextId);
    return containerItemEl;
  }

  bindContainerItemEl(containerItemEl, itemEl, item, key, index) {
    return this.onBindContainerItem?.(containerItemEl, itemEl, item, key, index);
  }

  afterBindContainerItemEl(containerItemEl, itemEl, item, key, index) {
    return this.onAfterBindContainerItem?.(containerItemEl, itemEl, item, key, index);
  }

  appendEl(el) {
    if (!el) {
      return;
    }

    this.containerEl.appendChild(el);
  }

  insertElByIndex(index, el) {
    if (!el) {
      return;
    }

    const currentElInPos = this.containerEl.children[index];
    if (currentElInPos) {
      if (el !== currentElInPos) {
        this.containerEl.insertBefore(el, currentElInPos);
      }
    } else {
      this.containerEl.appendChild(el);
    }
  }
}

export class ListRenderController {
  /**
   * @type {HTMLElementRenderAdapter}
   */
  renderAdapter;

  /**
   * @param {HTMLElementRenderAdapter} renderAdapter
   */
  constructor(renderAdapter) {
    this.renderAdapter = renderAdapter;

    this.__subscriptions = new Map();

    this.__taskManager = new TaskManager();
  }

  dispose() {
    if (this.disposed) {
      return;
    }

    this.cancelOperations();
    this.__clearSubscriptions();
    this.renderAdapter = null;
    this.disposed = true;
  }

  /**
   * @param {Array} list
   */
  render(list) {
    if (this.disposed) {
      return;
    }

    this.cancelOperations();

    list = list ?? [];

    const total = list.length;

    const keysSetToPreserve = new Set();

    let key;
    let item;
    let itemEl;
    let containerItemEl;
    let containerItemSubscription;
    let containerAfterItemSubscription;
    let itemSubscription;
    let itemAfterSubscription;
    for (let i = 0; i < total; ++i) {
      item = list[i];
      key = this.renderAdapter.extractKey(item, i);

      containerItemEl = this.renderAdapter.findContainerItemElByKey(key);

      if (!containerItemEl) {
        itemEl = this.renderAdapter.createItemEl(item, key, i);
        itemSubscription = this.renderAdapter.bindItemEl(itemEl, item, key, i);
        containerItemEl = this.renderAdapter.createContainerItemEl(itemEl, item, key, i);
        containerItemSubscription = this.renderAdapter.bindContainerItemEl(containerItemEl, itemEl, item, key, i);
      } else {
        this.__unsubscribeByKey(key);

        itemEl = this.renderAdapter.findItemElByKey(key);
        itemSubscription = this.renderAdapter.bindItemEl(itemEl, item, key, i);
        containerItemSubscription = this.renderAdapter.bindContainerItemEl(containerItemEl, itemEl, item, key, i);
      }

      this.renderAdapter.insertElByIndex(i, containerItemEl);

      itemAfterSubscription = this.renderAdapter.afterBindItemEl(itemEl, item, key, i);

      containerAfterItemSubscription = this.renderAdapter.afterBindContainerItemEl(
        containerItemEl,
        itemEl,
        item,
        key,
        i
      );

      this.__addSubscriptionByKey(
        key,
        containerItemSubscription,
        itemSubscription,
        itemAfterSubscription,
        containerAfterItemSubscription
      );

      keysSetToPreserve.add(key);
    }

    this.__removeAllExceptKeySet(keysSetToPreserve);
  }

  /**
   * @param {string} key
   * @returns {Element} container element or null if not found
   */
  findContainerItemElByKey(key) {
    return this.renderAdapter.findContainerItemElByKey(key);
  }

  /**
   * @param {string} key
   * @returns {Element} element or null if not found
   */
  findItemElByKey(key) {
    return this.renderAdapter.findItemElByKey(key);
  }

  addOrUpdate(item) {
    this.addOrUpdateRange([item]);
  }

  /**
   * @param {Array} list
   */
  addOrUpdateRange(list) {
    if (this.disposed) {
      return;
    }

    this.__addOrUpdateRangeIntoIndex(this.renderAdapter.count(), list, false);
  }

  /**
   * @param {number} targetIndex
   * @param {any} item
   */
  addOrUpdateIntoIndex(targetIndex, item) {
    this.addOrUpdateRangeIntoIndex(targetIndex, [item]);
  }

  /**
   * @param {number} targetIndex
   * @param {Array} list
   */
  addOrUpdateRangeIntoIndex(targetIndex, list) {
    this.__addOrUpdateRangeIntoIndex(targetIndex, list, true);
  }

  removeByKey(key) {
    this.removeRangeByKeys([key]);
  }

  removeRangeByKeys(keys) {
    if (this.disposed) {
      return;
    }

    this.cancelOperations();

    let key;
    for (let i = 0; i < keys.length; ++i) {
      key = keys[i];

      const el = this.renderAdapter.findContainerItemElByKey(key);
      if (el) {
        this.renderAdapter.removeEl(el);
      }

      this.__unsubscribeByKey(key);
    }
  }

  /**
   * @param {number} index
   */
  removeByIndex(index) {
    this.removeRange(index, 1);
  }

  /**
   * @param {number} start
   * @param {number} count
   */
  removeRange(start, count) {
    if (this.disposed) {
      return;
    }

    this.cancelOperations();

    const listEl = this.renderAdapter.listContainerItemEl();
    if (listEl?.length) {
      const total = listEl.length;

      start = Math.min(Math.max(start ?? 0, 0), total);
      count = Math.min(Math.max(count ?? total, 1), total);

      const itemsRemoved = listEl.slice(start, count);
      let el;
      let key;
      for (let i = 0; i < itemsRemoved.length; ++i) {
        el = itemsRemoved[i];
        key = this.renderAdapter.extractKeyFromEl(el);
        this.renderAdapter.removeEl(el);
        this.__unsubscribeByKey(key);
      }
    }
  }

  cancelOperations() {
    if (this.disposed) {
      return;
    }

    this.__taskManager.cancelTasks();
  }

  async renderAsync(list) {
    if (this.disposed) {
      return;
    }

    this.cancelOperations();

    const task = new TaskOperation(async (abortSignal) => {
      list = list ?? [];

      const total = list.length;

      const chunkSize = this.__chunkSizeCalc(total);
      const listChunked = _.chunk(list, chunkSize);

      const keysSetToPreserve = new Set();

      let counter = 0;
      let listItem;
      let key;
      let item;
      let itemEl;
      let containerItemEl;
      let containerItemSubscription;
      let containerAfterItemSubscription;
      let itemSubscription;
      let itemAfterSubscription;
      for (let j = 0; j < listChunked.length; j++) {
        if (abortSignal?.aborted) {
          break;
        }

        counter += listItem?.length ?? 0;
        listItem = listChunked[j];

        await postSchedule(async () => {
          let index;

          for (let i = 0; i < listItem.length; ++i) {
            if (abortSignal?.aborted) {
              return;
            }

            index = counter + i;
            item = listItem[i];

            key = this.renderAdapter.extractKey(item, index);

            containerItemEl = this.renderAdapter.findContainerItemElByKey(key);

            if (!containerItemEl) {
              await scheduleAsync(() => {
                itemEl = this.renderAdapter.createItemEl(item, key, index);
              }, abortSignal);

              if (abortSignal?.aborted) {
                return;
              }

              await scheduleAsync(() => {
                itemSubscription = this.renderAdapter.bindItemEl(itemEl, item, key, index);
              }, abortSignal);

              if (abortSignal?.aborted) {
                return;
              }

              await scheduleAsync(() => {
                containerItemEl = this.renderAdapter.createContainerItemEl(itemEl, item, key, index);
              }, abortSignal);

              if (abortSignal?.aborted) {
                return;
              }

              await scheduleAsync(() => {
                containerItemSubscription = this.renderAdapter.bindContainerItemEl(
                  containerItemEl,
                  itemEl,
                  item,
                  key,
                  index
                );
              }, abortSignal);
            } else {
              this.__unsubscribeByKey(key);

              itemEl = this.renderAdapter.findItemElByKey(key);

              await scheduleAsync(() => {
                itemSubscription = this.renderAdapter.bindItemEl(itemEl, item, key, index);
              }, abortSignal);

              if (abortSignal?.aborted) {
                return;
              }

              await scheduleAsync(() => {
                containerItemSubscription = this.renderAdapter.bindContainerItemEl(
                  containerItemEl,
                  itemEl,
                  item,
                  key,
                  index
                );
              }, abortSignal);
            }

            if (abortSignal?.aborted) {
              return;
            }

            await scheduleAsync(() => {
              this.renderAdapter.insertElByIndex(index, containerItemEl);
            }, abortSignal);

            if (abortSignal?.aborted) {
              return;
            }

            await scheduleAsync(() => {
              itemAfterSubscription = this.renderAdapter.afterBindItemEl(itemEl, item, key, index);
            }, abortSignal);

            if (abortSignal?.aborted) {
              return;
            }

            await scheduleAsync(() => {
              containerAfterItemSubscription = this.renderAdapter.afterBindContainerItemEl(
                containerItemEl,
                itemEl,
                item,
                key,
                index
              );
            }, abortSignal);

            if (abortSignal?.aborted) {
              return;
            }

            this.__addSubscriptionByKey(
              key,
              containerItemSubscription,
              itemSubscription,
              itemAfterSubscription,
              containerAfterItemSubscription
            );

            containerItemSubscription =
              itemSubscription =
              itemAfterSubscription =
              containerAfterItemSubscription =
                null;

            keysSetToPreserve.add(key);
          }
        }, abortSignal);
      }

      if (abortSignal?.aborted) {
        this.__resolveSubscription([
          containerItemSubscription,
          itemSubscription,
          itemAfterSubscription,
          containerAfterItemSubscription,
        ])?.unsubscribe?.();
        return;
      }

      this.__removeAllExceptKeySet(keysSetToPreserve);
    });

    await this.__taskManager.executeAsync(task);
  }

  addOrUpdateAsync(item) {
    return this.addOrUpdateRangeAsync([item]);
  }

  /**
   * @param {Array} list
   */
  addOrUpdateRangeAsync(list) {
    if (this.disposed) {
      return;
    }

    return this.__addOrUpdateRangeIntoIndexAsync(this.renderAdapter.count(), list, false);
  }

  /**
   * @param {number} targetIndex
   * @param {any} item
   */
  addOrUpdateIntoIndexAsync(targetIndex, item) {
    return this.addOrUpdateRangeIntoIndexAsync(targetIndex, [item]);
  }

  /**
   * @param {number} targetIndex
   * @param {Array} list
   */
  addOrUpdateRangeIntoIndexAsync(targetIndex, list) {
    return this.__addOrUpdateRangeIntoIndexAsync(targetIndex, list, true);
  }

  removeByKeyAsync(key) {
    return this.removeRangeByKeysAsync([key]);
  }

  async removeRangeByKeysAsync(keys) {
    if (this.disposed) {
      return;
    }

    keys = keys ?? [];

    const task = new TaskOperation(() => {
      let key;
      for (let i = 0; i < keys.length; ++i) {
        key = keys[i];

        const el = this.renderAdapter.findContainerItemElByKey(key);
        if (el) {
          this.renderAdapter.removeEl(el);
        }

        this.__unsubscribeByKey(key);
      }
    });

    await this.__taskManager.executeAsync(task);
  }

  /**
   * @param {number} index
   */
  removeByIndexAsync(index) {
    return this.removeRangeAsync(index, 1);
  }

  /**
   * @param {number} start
   * @param {number} count
   */
  async removeRangeAsync(start, count) {
    if (this.disposed) {
      return;
    }

    const task = new TaskOperation(async (abortSignal) => {
      await this.__removeRangeInternalAsync(abortSignal, start, count);
    });

    await this.__taskManager.executeAsync(task);
  }

  clear() {
    this.cancelOperations();
    this.removeRange(0);
    this.__clearSubscriptions();
  }

  /**
   * @private
   */
  __chunkSizeCalc(size) {
    return Math.ceil(Math.max(Math.min(size, 50), size / 10));
  }

  /**
   * @private
   *
   * @param {number} targetIndex
   * @param {Array} list
   * @param {boolean} shouldMove
   */
  __addOrUpdateRangeIntoIndex(targetIndex, list, shouldMove) {
    if (this.disposed) {
      return;
    }

    this.cancelOperations();

    list = list ?? [];

    let index;
    let key;
    let item;
    let itemEl;
    let containerItemEl;
    let containerItemSubscription;
    let containerAfterItemSubscription;
    let itemSubscription;
    let itemAfterSubscription;
    for (let i = 0; i < list.length; ++i) {
      item = list[i];

      index = targetIndex + i;
      key = this.renderAdapter.extractKey(item, index);
      containerItemEl = this.renderAdapter.findContainerItemElByKey(key);

      if (!containerItemEl) {
        itemEl = this.renderAdapter.createItemEl(item, key, index);
        itemSubscription = this.renderAdapter.bindItemEl(itemEl, item, key, index);
        containerItemEl = this.renderAdapter.createContainerItemEl(itemEl, item, key, index);
        containerItemSubscription = this.renderAdapter.bindContainerItemEl(containerItemEl, itemEl, item, key, index);

        this.renderAdapter.insertElByIndex(index, containerItemEl);
      } else {
        this.__unsubscribeByKey(key);

        itemEl = this.renderAdapter.findItemElByKey(key);
        itemSubscription = this.renderAdapter.bindItemEl(itemEl, item, key, index);
        containerItemSubscription = this.renderAdapter.bindContainerItemEl(containerItemEl, itemEl, item, key, index);

        if (shouldMove) {
          this.renderAdapter.insertElByIndex(index, containerItemEl);
        }
      }

      itemAfterSubscription = this.renderAdapter.afterBindItemEl(itemEl, item, key, index);

      containerAfterItemSubscription = this.renderAdapter.afterBindContainerItemEl(
        containerItemEl,
        itemEl,
        item,
        key,
        index
      );

      this.__addSubscriptionByKey(
        key,
        containerItemSubscription,
        itemSubscription,
        itemAfterSubscription,
        containerAfterItemSubscription
      );
    }
  }

  /**
   * @private
   *
   * @param {number} targetIndex
   * @param {Array} list
   * @param {boolean} shouldMove
   */
  async __addOrUpdateRangeIntoIndexAsync(targetIndex, list, shouldMove) {
    if (this.disposed) {
      return;
    }

    const task = new TaskOperation(async (abortSignal) => {
      list = list ?? [];

      const chunkSize = this.__chunkSizeCalc(list.length);
      const listChunked = _.chunk(list, chunkSize);

      let counter = 0;
      let listItem;
      let key;
      let item;
      let itemEl;
      let containerItemEl;
      let containerItemSubscription;
      let containerAfterItemSubscription;
      let itemSubscription;
      let itemAfterSubscription;
      for (let j = 0; j < listChunked.length; j++) {
        if (abortSignal?.aborted) {
          break;
        }

        counter += listItem?.length ?? 0;
        listItem = listChunked[j];

        await postSchedule(async () => {
          let index;

          for (let i = 0; i < listItem.length; ++i) {
            if (abortSignal?.aborted) {
              return;
            }

            index = targetIndex + counter + i;
            item = listItem[i];

            key = this.renderAdapter.extractKey(item, index);

            containerItemEl = this.renderAdapter.findContainerItemElByKey(key);

            if (!containerItemEl) {
              await scheduleAsync(() => {
                itemEl = this.renderAdapter.createItemEl(item, key, index);
              }, abortSignal);

              if (abortSignal?.aborted) {
                return;
              }

              await scheduleAsync(() => {
                itemSubscription = this.renderAdapter.bindItemEl(itemEl, item, key, index);
              }, abortSignal);

              if (abortSignal?.aborted) {
                return;
              }

              await scheduleAsync(() => {
                containerItemEl = this.renderAdapter.createContainerItemEl(itemEl, item, key, index);
              }, abortSignal);

              if (abortSignal?.aborted) {
                return;
              }

              await scheduleAsync(() => {
                containerItemSubscription = this.renderAdapter.bindContainerItemEl(
                  containerItemEl,
                  itemEl,
                  item,
                  key,
                  index
                );
              }, abortSignal);

              if (abortSignal?.aborted) {
                return;
              }

              await scheduleAsync(() => {
                this.renderAdapter.insertElByIndex(index, containerItemEl);
              }, abortSignal);
            } else {
              this.__unsubscribeByKey(key);

              itemEl = this.renderAdapter.findItemElByKey(key);

              await scheduleAsync(() => {
                itemSubscription = this.renderAdapter.bindItemEl(itemEl, item, key, index);
              }, abortSignal);

              if (abortSignal?.aborted) {
                return;
              }

              await scheduleAsync(() => {
                containerItemSubscription = this.renderAdapter.bindContainerItemEl(
                  containerItemEl,
                  itemEl,
                  item,
                  key,
                  index
                );
              }, abortSignal);

              if (shouldMove) {
                if (abortSignal?.aborted) {
                  return;
                }

                await scheduleAsync(() => {
                  this.renderAdapter.insertElByIndex(index, containerItemEl);
                }, abortSignal);
              }
            }

            if (abortSignal?.aborted) {
              return;
            }

            await scheduleAsync(() => {
              itemAfterSubscription = this.renderAdapter.afterBindItemEl(itemEl, item, key, index);
            }, abortSignal);

            if (abortSignal?.aborted) {
              return;
            }

            await scheduleAsync(() => {
              containerAfterItemSubscription = this.renderAdapter.afterBindContainerItemEl(
                containerItemEl,
                itemEl,
                item,
                key,
                index
              );
            }, abortSignal);

            if (abortSignal?.aborted) {
              return;
            }

            this.__addSubscriptionByKey(
              key,
              containerItemSubscription,
              itemSubscription,
              itemAfterSubscription,
              containerAfterItemSubscription
            );
          }
        }, abortSignal);
      }

      if (abortSignal?.aborted) {
        this.__resolveSubscription([
          containerItemSubscription,
          itemSubscription,
          itemAfterSubscription,
          containerAfterItemSubscription,
        ])?.unsubscribe?.();
      }
    });

    await this.__taskManager.executeAsync(task);
  }

  /**
   * @private
   */
  async __removeRangeInternalAsync(abortSignal, start, count) {
    if (this.disposed) {
      return;
    }

    if (abortSignal?.aborted) {
      return;
    }

    const listEl = this.renderAdapter.listContainerItemEl();
    if (listEl?.length) {
      const total = listEl.length;

      start = Math.min(Math.max(start ?? 0, 0), total);
      count = Math.min(Math.max(count ?? total, 1), total);

      const itemsRemoved = listEl.slice(start, count);
      let el;
      let key;
      for (let i = 0; i < itemsRemoved.length; ++i) {
        el = itemsRemoved[i];

        key = this.renderAdapter.extractKeyFromEl(el);

        await scheduleAsync(() => {
          this.renderAdapter.removeEl(el);
        }, abortSignal);

        if (abortSignal?.aborted) {
          return;
        }

        this.__unsubscribeByKey(key);
      }
    }
  }

  /**
   * @private
   *
   * @param {Set<any>} keysSet
   */
  __removeAllExceptKeySet(keysSet) {
    if (this.disposed) {
      return;
    }

    const listEl = this.renderAdapter.listContainerItemEl();
    if (listEl?.length) {
      const total = listEl.length;

      const currentContextId = this.renderAdapter.contextId;

      let el;
      let key;
      let contextId;
      let isSameContext = false;
      for (let i = 0; i < total; ++i) {
        el = listEl[i];

        key = this.renderAdapter.extractKeyFromEl(el);
        contextId = this.renderAdapter.extractContextKeyFromEl(el);

        isSameContext = contextId === currentContextId;

        if (isSameContext && keysSet.has(key)) {
          continue;
        }

        this.renderAdapter.removeEl(el);

        if (isSameContext) {
          this.__unsubscribeByKey(key);
        }
      }
    }
  }

  /**
   * @private
   */
  __addSubscriptionByKey(key, ...subscriptions) {
    const subscription = this.__resolveSubscription(subscriptions);
    if (subscription) {
      this.__subscriptions.set(key, subscription);
    }
  }

  /**
   * @private
   */
  __unsubscribeByKey(key) {
    if (this.disposed) {
      return;
    }

    if (this.__subscriptions.has(key)) {
      this.__subscriptions.get(key)?.unsubscribe?.();
      this.__subscriptions.delete(key);
    }
  }

  /**
   * @private
   */
  __clearSubscriptions() {
    if (this.disposed) {
      return;
    }

    for (let item of this.__subscriptions.values()) {
      item?.unsubscribe?.();
    }

    this.__subscriptions.clear();
  }

  /**
   * @private
   */
  __resolveSubscription(subscriptions) {
    let subscription;

    for (let sub of subscriptions) {
      if (Array.isArray(sub)) {
        sub = this.__resolveSubscription(sub);
      } else if (typeof sub === 'function') {
        sub = new Rxjs.Subscription(sub);
      }

      if (!subscription && sub) {
        subscription = sub;
      } else if (subscription && sub) {
        subscription.add(sub);
      } else if (!subscription) {
        subscription = sub;
      }
    }

    return subscription;
  }
}

function postSchedule(callback, abortSiganl) {
  return scheduleDelayAsync(callback, 0, abortSiganl);
}
