import { TextAlignment } from './shared.js';
import { BasePanel } from './panel.dto.js';

export class SimpleList {
  static typeName = 'widget-simple-list';

  /**
   * @param  {TextAlignment} alignment
   * @param  {BaseSimpleList} base
   * @param  {BasePanel} outerPanel
   * @param  {BasePanel} headerPanel
   * @param  {BasePanel} itemPanel
   * @param  {string} title
   */
  constructor(alignment, base, outerPanel, headerPanel, itemPanel, title) {
    this.alignment = Object.freeze(alignment);
    this.base = base;
    this.outerPanel = outerPanel;
    this.headerPanel = headerPanel;
    this.itemPanel = itemPanel;
    this.title = title;
  }
}

export class BaseSimpleList {
  /**
   * @param  {AnyComponent} anyComponent
   * @param  {{id: string; value: any;}[]} options
   * @param  {boolean} is_required
   */
  constructor(anyComponent, options, is_required) {
    this.headerComponent = anyComponent;
    this.options = options;
    this.is_required = is_required;
  }
}

export class AnyComponent {
  /**
   * @param  {string} typeName
   * @param  {any} props
   */
  constructor(typeName, props) {
    this.typeName = typeName;
    this.props = props;
  }
}
