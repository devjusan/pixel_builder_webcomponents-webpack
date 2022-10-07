import { Dialogs } from '../domain/models/pixel/index.js';
import { DialogConfig, SimpleDialogConfig } from '../adapters/dialogs.adapter.js';
import * as Rxjs from 'rxjs';

class DialogsService {
  #state;

  constructor() {
    this.#state = new Dialogs(null, {
      'dialogs-default': () => document.createElement('pixel-dialogs-default'),
    });

    this.stateSubject = new Rxjs.BehaviorSubject(this.#state);
  }

  /**
   * @param  {DialogConfig | SimpleDialogConfig} config
   */
  open(config) {
    this.#state.open(config);
    this.stateNext();
  }

  close() {
    this.#state.close();
    this.stateNext();
  }

  stateNext() {
    this.stateSubject.next(this.#state);
  }

  getObservable() {
    if (!this.stateObservable) {
      this.stateObservable = this.stateSubject.asObservable();
    }

    return this.stateObservable;
  }
}

export default new DialogsService();
