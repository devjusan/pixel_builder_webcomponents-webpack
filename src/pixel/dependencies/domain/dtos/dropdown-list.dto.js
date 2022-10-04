import { TextAlignment } from './shared.js';

export class BaseDropdownList {
  static typeName = 'widget-dropdown-list';

  /**
   * @param  {string} description
   * @param  {string[]} options
   * @param  {boolean} is_required
   */
  constructor(description, options, is_required) {
    this.description = description;
    this.options = options;
    this.is_required = is_required;
  }
}

export class DropdownList extends BaseDropdownList {
  /**
   * @param  {TextAlignment} alignment
   * @param  {string} description
   * @param  {string[]} options
   * @param  {boolean} is_required
   */
  constructor(alignment, description, options, is_required) {
    super(description, options, is_required);
    this.alignment = Object.freeze(alignment);
  }
}
