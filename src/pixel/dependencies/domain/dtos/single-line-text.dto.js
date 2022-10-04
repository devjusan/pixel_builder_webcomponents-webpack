import { TextAlignment } from './shared.js';

export class BaseSingleLineText {
  static typeName = 'widget-single-line-text';

  /**
   * @param  {string} description
   * @param  {string} default_value
   * @param  {number} min_length
   * @param  {number} max_length
   * @param  {boolean} is_required
   * @param  {string | undefined} dependentId
   */
  constructor(description, default_value, min_length, max_length, is_required, dependentId) {
    this.description = description;
    this.default_value = default_value;
    this.min_length = min_length;
    this.max_length = max_length;
    this.is_required = is_required;
    this.dependentId = dependentId;
  }
}

export class SingleLineText extends BaseSingleLineText {
  /**
   * @param  {TextAlignment} alignment
   * @param  {string} description
   * @param  {string} default_value
   * @param  {number} min_length
   * @param  {number} max_length
   * @param  {boolean} is_required
   * @param  {string | undefined} dependentId
   */
  constructor(alignment, description, default_value, min_length, max_length, is_required, dependentId) {
    super(description, default_value, min_length, max_length, is_required, dependentId);
    this.alignment = Object.freeze(alignment);
  }
}
