import { TextAlignment } from './shared.js';

export class BaseButton {
  static typeName = 'widget-button';

  /**
   * @param  {string} description
   */
  constructor(description) {
    this.description = description;
  }
}

export class Button extends BaseButton {
  /**
   * @param  {TextAlignment} alignment
   * @param  {string} description
   */
  constructor(alignment, description) {
    super(description);
    this.alignment = Object.freeze(alignment);
  }
}
