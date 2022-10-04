import { PixelUtils } from '../../../../utils/index.js';

export class PixelComponent {
  /** @typedef {{rowStart: number; rowEnd: number; columnStart: number; columnEnd: number}} GridPos */

  /**
   * @param  {string} typeName
   * @param  {GridPos} gridPos
   * @param  {any} initialProps
   * @param  {string|undefined} id
   */
  constructor(typeName, gridPos, initialProps, id) {
    /**@type {string} */
    this.id = id;
    /**@type {string} */
    this.typeName = typeName;
    /**@type {any} */
    this.props = initialProps;
    /**@type {GridPos} */
    this.gridPos = gridPos;
    /**@type {string[]} */
    this.classNames = [];

    this.getComponentPageIndex = PixelComponent.getComponentPageIndex;
  }

  static isValidGroupComponent(typeName) {
    return PixelUtils.isValidGroupComponent(typeName);
  }

  static getComponentPageIndex() {
    return PixelUtils.getComponentPageIndex(this.id);
  }
}
