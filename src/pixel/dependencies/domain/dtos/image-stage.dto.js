import { TextAlignment } from './shared.js';

export class BaseImageStage {
  static typeName = 'widget-image-stage';

  /**
   * @param  {string} description
   * @param  {string} image_src
   * @param  {number} range_input
   */
  constructor(description, image_src, range_input) {
    this.description = description;
    this.image_src = image_src;
    this.range_input = range_input;
  }
}

export class ImageStage extends BaseImageStage {
  static typeName = 'widget-image-stage';

  /**
   * @param  {TextAlignment} alignment
   * @param  {string} description
   * @param  {string} image_src
   * @param  {number} range_input
   * @param  {boolean} is_required
   */
  constructor(alignment, description, image_src, range_input) {
    super(description, image_src, range_input);
    this.alignment = Object.freeze(alignment);
  }
}
