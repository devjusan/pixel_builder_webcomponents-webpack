import { PixelComponent } from './pixel-component.model.js';
import { PixelPage } from './pixel-page.model.js';

export class PixelPaginator {
  /** @type {PixelPage[]} */
  #pages;
  /** @type {number} */
  #active;
  /**@type{number} */
  #total;

  get pages() {
    return this.#pages;
  }

  /** @param {PixelPage[]} */
  set pages(pages) {
    this.#pages = pages;
    this.#total = pages.length;
  }

  get active() {
    return this.#active;
  }

  set active(active) {
    this.#active = _.clamp(active, 0, this.total - 1);
  }

  get total() {
    return this.#total;
  }

  /**
   * @param  {number} active
   * @param  {PixelPage[]} pages
   */
  constructor(active, pages) {
    this.pages = pages;
    this.active = active;
  }

  getPage(pageIndex) {
    return this.pages[pageIndex];
  }

  getActivePage() {
    return this.getPage(this.active);
  }

  paginateNext() {
    this.active = this.#active + 1;
  }

  paginatePrevious() {
    this.active = this.#active - 1;
  }

  fromJSON(paginator) {
    const { active, pages } = paginator;

    this.pages = pages.map((page) => new PixelPage(this.__recursivelyParseComponents(page.components), page.id));
    this.active = active;
  }

  findComponentById(id) {
    return this.pages.find((page) => page.findComponentById(id))?.findComponentById(id);
  }

  __recursivelyParseComponents(components) {
    const arr = new Array(components.length);
    let component;

    for (let i = 0; i < components.length; ++i) {
      component = components[i];
      const pixelComponent = new PixelComponent(component.typeName, component.gridPos, component.props, component.id);

      if (PixelComponent.isValidGroupComponent(pixelComponent.typeName)) {
        pixelComponent.props.components = this.__recursivelyParseComponents(pixelComponent.props.components);
      }

      arr[i] = pixelComponent;
    }

    return arr;
  }

  toJSON() {
    return {
      pages: this.pages,
      active: this.active,
      total: this.total,
    };
  }
}
