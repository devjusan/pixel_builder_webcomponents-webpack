import { TextAlignment } from './shared.js';

export class BaseFolderSelector {
  static typeName = 'widget-folder-selector';

  /**
   * @param  {string} description
   * @param  {boolean} is_required
   */
  constructor(description, is_required) {
    this.description = description;
    this.is_required = is_required;
  }
}

export class FolderSelector extends BaseFolderSelector {
  /**
   * @param  {TextAlignment} alignment
   * @param  {string} description
   * @param  {boolean} is_required
   */
  constructor(alignment, description, is_required) {
    super(description, is_required);
    this.alignment = Object.freeze(alignment);
  }
}
