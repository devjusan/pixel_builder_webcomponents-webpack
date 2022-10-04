import { PixelError } from '../../dependencies/index.js';
import { Map, ResultTable } from '../../dependencies/domain/dtos/index.js';

export default class StorageTypes {
  constructor() {
    throw new Error('This class is static');
  }

  static get types() {
    return {
      RESULT_TABLE: ResultTable.typeName,
      MAP: Map.typeName,
    };
  }

  static get options() {
    return [
      { text: 'Tabela de Resultados', value: ResultTable.typeName },
      { text: 'Mapa', value: Map.typeName },
    ];
  }

  /**
   * @param {string} typeName
   * @returns {string}
   */
  static bodyOptions(typeName) {
    const BODY_OPTIONS = {
      [ResultTable.typeName]: 'app-result-table-editor-body',
      [Map.typeName]: 'app-map-editor-body',
    };

    if (!BODY_OPTIONS[typeName]) {
      throw new PixelError(PixelError.Errors.INVALID_COMPONENTS_BUCKET_MAP_TYPENAME);
    }

    return BODY_OPTIONS[typeName];
  }

  /**
   * @param {string} typeName
   * @returns {boolean}
   */
  static has(typeName) {
    return !!StorageTypes.options.some((option) => option.value === typeName);
  }
}
