import { TextAlignment } from './shared.js';

export class BaseMultiLineText {
  static typeName = 'widget-multi-line-text';

  /**
   * @param  {string} description
   * @param  {string} default_value
   * @param  {number} min_length
   * @param  {number} max_length
   * @param  {boolean} is_required
   */
  constructor(description, default_value, min_length, max_length, is_required) {
    this.description = description;
    this.default_value = default_value;
    this.min_length = min_length;
    this.max_length = max_length;
    this.is_required = is_required;
  }
}

export class MultiLineText extends BaseMultiLineText {
  /**
   * @param  {TextAlignment} alignment
   * @param  {string} description
   * @param  {string} default_value
   * @param  {number} min_length
   * @param  {number} max_length
   * @param  {boolean} is_required
   */
  constructor(alignment, description, default_value, min_length, max_length, is_required) {
    super(description, default_value, min_length, max_length, is_required);
    this.alignment = Object.freeze(alignment);
  }
}
