export default class DynamicNote {
  static typeName = 'widget-dynamic-note';

  /**
   * @param  {string} template
   * @param  {string} title
   */
  constructor(template, title) {
    this.template = template;
    this.title = title;
  }
}
