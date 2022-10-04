import { TextAlignment } from './shared.js';

export class BaseMap {
  static typeName = 'widget-map';

  /**
   * @param  {string} description
   * @param  {'geom' | 'coords' | 'code' | undefined} entriesType
   */
  constructor(description, entriesType) {
    this.description = description;
    this.entriesType = entriesType;
  }
}

export class Map extends BaseMap {
  /**
   * @param  {TextAlignment} alignment
   * @param  {string} description
   * @param  {'geom' | 'coords' | 'code' | undefined} entriesType
   */
  constructor(alignment, description, entriesType) {
    super(description, entriesType);
    this.alignment = Object.freeze(alignment);
  }
}
