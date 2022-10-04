import { TextAlignment } from './shared.js';

export class BaseMaskedInput {
  static typeName = 'widget-masked-input';

  /**
   * @param  {string} description
   * @param  {string} default_value
   * @param  {number} mask
   * @param  {boolean} is_required
   */
  constructor(description, default_value, mask, is_required) {
    this.description = description;
    this.default_value = default_value;
    this.mask = mask;
    this.is_required = is_required;
  }
}

export class MaskedInput extends BaseMaskedInput {
  /**
   * @param  {TextAlignment} alignment
   * @param  {string} description
   * @param  {string} default_value
   * @param  {number} mask
   * @param  {boolean} is_required
   */
  constructor(alignment, description, default_value, mask, is_required) {
    super(description, default_value, mask, is_required);
    this.alignment = Object.freeze(alignment);
  }
}
