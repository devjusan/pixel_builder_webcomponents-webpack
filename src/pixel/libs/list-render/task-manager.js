import { scheduleAsync } from './schedule.js';
import * as Rxjs from 'rxjs';

export class TaskManager {
  /**
   * @type {Array.<TaskOperation>}
   */
  _taskOperations;

  constructor() {
    this._taskOperations = [];
  }

  cancelTasks() {
    this._taskOperations?.forEach?.((task) => {
      task?.abort?.();
    });
    this._taskOperations = [];
  }

  /**
   * @param {TaskOperation | ((abortSignal: AbortSignal) => Promise | void)} task
   */
  async executeAsync(task) {
    if (!(task instanceof TaskOperation)) {
      task = new TaskOperation(task);
    }

    this.addTask(task);

    await task.onFinish;
  }

  /**
   * @param {TaskOperation} task
   */
  addTask(task) {
    this._taskOperations.push(task);
    this.drainAsync();
  }

  async drainAsync() {
    let index = this._taskOperations.findIndex((task) => task.executing || (!task.aborted && !task.completed));

    if (index > -1) {
      let task = this._taskOperations[index];
      if (!task.executing) {
        await task.execute();
        this._taskOperations.splice(index, 1);
      } else {
        await task.onFinish;
      }

      await this.drainAsync();
    }
  }
}

export class TaskOperation {
  /**
   * @type {((abortSignal: AbortSignal) => Promise | void)}
   */
  taskFn;

  /**
   * @type {boolean}
   */
  executing = false;

  /**
   * @type {boolean}
   */
  completed = false;

  /**
   * @type {boolean}
   */
  aborted = false;

  /**
   * @type {AbortController}
   */
  #abortController;

  /**
   * @type {Promise}
   */
  onFinish;

  /**
   * @param {((abortSignal: AbortSignal) => Promise | void)} taskFn
   */
  constructor(taskFn) {
    this.taskFn = taskFn;
    this._onFinishSubject = new Rxjs.Subject();

    this.onFinish = this._onFinishSubject.toPromise();
  }

  async execute() {
    if (this.aborted || this.completed || this.executing) {
      return;
    }

    this.#abortController = new AbortController();
    const taskFn = this.taskFn;
    this.taskFn = null;

    this.executing = true;
    await scheduleAsync(() => {
      return taskFn(this.#abortController.signal);
    }, this.#abortController.signal);
    this.executing = false;
    if (!this.aborted) {
      this.completed = true;
    }

    this._onFinishSubject.next();
    this._onFinishSubject.complete();
  }

  abort() {
    if (this.aborted || this.completed) {
      return;
    }

    this.#abortController?.abort?.();
    this.#abortController = null;
    this.taskFn = null;
    this._onFinishSubject.next();
    this._onFinishSubject.complete();
    this.aborted = true;
  }
}
