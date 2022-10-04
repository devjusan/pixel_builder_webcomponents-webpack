import { TextAlignment } from './shared.js';

export class BaseDate {
  static typeName = 'widget-date';

  /**
   * @param  {string} description
   * @param  {string} default_value
   * @param  {boolean} is_required
   */
  constructor(description, default_value, is_required) {
    this.description = description;
    this.default_value = default_value;
    this.is_required = is_required;
  }
}

export class Date extends BaseDate {

  /**
   * @param  {TextAlignment} alignment
   * @param  {string} description
   * @param  {string} default_value
   * @param  {boolean} is_required
   */
  constructor(alignment, description, default_value, is_required) {
    super(description, default_value, is_required);
    this.alignment = Object.freeze(alignment);
  }
}
