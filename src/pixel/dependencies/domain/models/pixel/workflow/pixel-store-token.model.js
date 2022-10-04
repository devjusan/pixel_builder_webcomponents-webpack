export class PixelWorkflowStoreToken {
  /**
   * @param  {PixelWorkflowFunction} fn
   * @param  {string} field?
   */
  constructor(fn = null, field = null) {
    /** @type {PixelWorkflowFunction} */
    this.fn = fn;
    /** @type {string} */
    this.field = field;
  }

  toJSON() {
    return { fn: this.fn?.id ?? null, field: this.field };
  }
}
