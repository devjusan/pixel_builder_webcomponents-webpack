import { TextAlignment } from './shared.js';

export class BaseNumeric {
  static typeName = 'widget-numeric';

  /**
   * @param  {string} description
   * @param  {string} default_value
   * @param  {number} min
   * @param  {number} max
   * @param  {boolean} is_required
   */
  constructor(description, default_value, min, max, is_required) {
    this.description = description;
    this.default_value = default_value;
    this.min = min;
    this.max = max;
    this.is_required = is_required;
  }
}

export class Numeric extends BaseNumeric {
  /**
   * @param  {TextAlignment} alignment
   * @param  {string} description
   * @param  {string} default_value
   * @param  {number} min
   * @param  {number} max
   * @param  {boolean} is_required
   */
  constructor(alignment, description, default_value, min, max, is_required) {
    super(description, default_value, min, max, is_required);
    this.alignment = Object.freeze(alignment);
  }
}
