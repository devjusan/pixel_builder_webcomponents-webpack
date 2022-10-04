export class BasePanel {
  static typeName = 'widget-base-panel';

  /**
   * @param  {string} border_color
   * @param  {number} border_width
   */
  constructor(border_color, border_width) {
    this.border_color = border_color;
    this.border_width = border_width;
  }
}

export class Panel extends BasePanel {
  static typeName = 'widget-panel';

  /**
   * @param  {string} border_color
   * @param  {number} border_width
   * @param  {Array<any>} components
   */
  constructor(border_color, border_width, components) {
    super(border_color, border_width);
    this.components = components;
  }
}
