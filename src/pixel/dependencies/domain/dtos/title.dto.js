import { TextAlignment } from './shared.js';

export class BaseTitle {
  static typeName = 'widget-title';

  /**
   * @param  {string} description
   * @param  {'small' | 'medium' | 'large'} size
   */
  constructor(description, size) {
    this.description = description;
    this.size = size;
  }
}

export class Title extends BaseTitle {
  /**
   * @param  {TextAlignment} alignment
   * @param  {string} description
   * @param  {'small' | 'medium' | 'large'} size
   */
  constructor(alignment, description, size) {
    super(description, size);
    this.alignment = Object.freeze(alignment);
  }
}
