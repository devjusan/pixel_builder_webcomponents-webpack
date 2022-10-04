export class PixelWorkflowToken {
  /**
   * @param  {{fn?:PixelWorkflowFunction;field?:string} | EditablePixelComponent} token
   */
  constructor(token) {
    this.token = token;
  }

  toJSON() {
    if (this.token instanceof EditablePixelWorkflowStoreToken) {
      const { fn = null, field = null } = this.token;
      return { fn: fn?.id ?? null, field };
    }

    if (this.token instanceof EditablePixelComponent) {
      return this.token.id;
    }
  }
}
