import { TextAlignment } from './shared.js';

export class BaseImageUpload {
  static typeName = 'widget-image-upload';

  /**
   * @param  {string} description
   * @param  {boolean} is_required
   */
  constructor(title, description, is_required) {
    this.title = title;
    this.description = description;
    this.is_required = is_required;
  }
}

export class ImageUpload extends BaseImageUpload {
  /**
   * @param  {TextAlignment} alignment
   * @param  {string} description
   * @param  {boolean} is_required
   */
  constructor(alignment, title, description, is_required) {
    super(title, description, is_required);
    this.alignment = Object.freeze(alignment);
  }
}
