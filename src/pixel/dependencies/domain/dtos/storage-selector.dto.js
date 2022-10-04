import { BaseResultTable } from './result-table.dto.js';
import { FullAlignment } from './shared.js';

export class BaseStorageSelector {
  static typeName = 'widget-storage-selector';
  static TYPES = {
    TABLE: 'widget-result-table',
    MAP: 'widget-map',
  };

  /**
   * @param {BaseResultTable | null} component
   * @param {'widget-result-table' | 'widget-map'} typeName
   */
  constructor(component, typeName) {
    this.component = component;
    this.typeName = typeName;
  }
}

export class StorageSelector extends BaseStorageSelector {
  /**
   * @param  {FullAlignment} alignment
   * @param {component} component
   */
  constructor(alignment, component, typeName) {
    super(component, typeName);
    this.alignment = Object.freeze(alignment);
  }
}
