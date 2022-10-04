import { PixelComponent } from './pixel-component.model.js';

export class PixelPage {
  /** @type {PixelComponent[]} */
  #components;
  /** @type {string} */
  #id;

  get components() {
    return this.#components;
  }

  get id() {
    return this.#id;
  }

  /**
   * @param  {PixelComponent[]} components
   */
  constructor(components, id) {
    this.#id = id;
    this.#components = components ?? [];
  }

  getAllComponents() {
    return this.__getAllComponents(this.components);
  }

  /** @returns {PixelComponent[]} */
  __getAllComponents(components) {
    const arr = [];

    for (let i = 0, tmp; i < components.length; ++i) {
      tmp = components[i];

      arr.push(tmp);

      if (PixelComponent.isValidGroupComponent(tmp.typeName)) {
        arr.push(...this.__getAllComponents(tmp.props.components));
      }
    }

    return arr;
  }

  /**
   * @param {string} id
   * @param {PixelComponent[]} components
   * @returns {PixelComponent | undefined}
   */
  findComponentById(id, components = this.components) {
    let tmp;

    for (let i = 0; i < components.length; ++i) {
      tmp = components[i];

      if (tmp.id === id) {
        return tmp;
      } else if (PixelComponent.isValidGroupComponent(tmp.typeName)) {
        tmp = this.findComponentById(id, tmp.props.components);
        if (tmp) return tmp;
      }
    }
  }

  toJSON() {
    return {
      id: this.id,
      components: this.components,
    };
  }
}
