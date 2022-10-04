import { DialogConfig, SimpleDialogConfig } from '../../../../adapters/dialogs.adapter.js';

export default class Dialogs {
  /**@typedef {Object.<string,() => DialogAdapter>} dialogsState */

  /**@type {dialogsState} */
  #dialogsState;
  /**@type boolean */
  #open;

  get isOpen() {
    return this.#open;
  }

  /**
   * @param  {DialogAdapter | undefined} activeDialog
   * @param  {Record<string,() => DialogAdapter>} dialogs
   */
  constructor(activeDialog, dialogs) {
    this.#dialogsState = dialogs;
    this.activeDialog = activeDialog;
    this.#open = Boolean(activeDialog);
  }
  /**
   * @param  {DialogConfig | SimpleDialogConfig} config
   */
  open(config) {
    this.#open = true;
    this.activeDialog = this.#dialogsState[config.view]();
    this.activeDialog.setDialogConfig(config);
  }

  close() {
    this.#open = false;
    this.activeDialog = null;
  }
}
