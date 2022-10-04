import { ObjectUtils } from '../index.js';
import { pixelService } from '../services/index.js';

export default class PixelUtils {
  static GRID = {
    SIZE_PRESETS: {
      1: {
        horizontal: 10,
        vertical: 14,
      },
      2: {
        horizontal: 16,
        vertical: 16,
      },
      3: {
        horizontal: 22,
        vertical: 18,
      },
      4: {
        horizontal: 28,
        vertical: 24,
      },
    },
    UNIT_SIZE: {
      width: 50,
      height: 30,
    },
    gap: 3,
    padding: 3,
  };
  static COMPONENT_GROUP_LIST = ['widget-panel'];
  static COMPONENT_AS_MULTIPLE_OUTCOMES_LIST = ['widget-dynamic-note'];
  static COMPONENT_TABLE = ['widget-result-table', 'widget-calculator-table'];
  static COMPONENT_MAP = ['widget-map'];
  static #MULTIPLICATOR_TYPENAME = 'widget-pages-multiplicator-table';
  static #STORAGE_COMPONENTS = ['widget-storage-selector'];

  static isValidGroupComponent(typeName) {
    return this.COMPONENT_GROUP_LIST.includes(typeName);
  }

  static isValidStorageComponent(typeName) {
    return this.#STORAGE_COMPONENTS.includes(typeName);
  }

  static isValidMultipleOutcomesEntriesComponent(typeName) {
    return this.COMPONENT_AS_MULTIPLE_OUTCOMES_LIST.includes(typeName);
  }

  static isValidComponentWithInternalTable(el) {
    return el?.querySelector('widget-result-table');
  }

  static isValidComponentWithInternalMap(el) {
    return el?.querySelector('widget-map');
  }

  static isValidComponentTable(typeName) {
    return this.COMPONENT_TABLE.includes(typeName);
  }

  static isValidComponentMap(typeName) {
    return this.COMPONENT_MAP.includes(typeName);
  }

  static isValidComponentWithArrayList(typeName, id) {
    return (
      this.isValidComponentTable(typeName) ||
      this.isValidComponentMap(typeName) ||
      this.#STORAGE_COMPONENTS.includes(typeName)
    );
  }

  static getArrayList(typeName, componentId) {
    const component = document.getElementById(componentId);

    if (PixelUtils.isValidComponentMap(typeName)) {
      return component.entriesList ?? [];
    } else if (PixelUtils.isValidComponentWithInternalMap(component)) {
      const internal = component.querySelector('widget-map');

      return internal.entriesList ?? [];
    } else if (PixelUtils.isValidComponentTable(typeName)) {
      component.withFillInputsValues(null);
      return component.converttedValues ?? [];
    } else if (PixelUtils.isValidComponentWithInternalTable(component)) {
      const internal = component.querySelector('widget-result-table');

      return internal.converttedValues ?? [];
    } else {
      throw new Error('Invalid type');
    }
  }

  static fillArrayList(typeName, componentId, newValue) {
    const component = document.getElementById(componentId);

    if (PixelUtils.isValidComponentMap(typeName)) {
      return component.addEntriesList(newValue);
    } else if (PixelUtils.isValidComponentTable(typeName)) {
      component.withFillInputsValues(newValue, true);
    } else if (PixelUtils.isValidStorageComponent(typeName)) {
      component.updateComponentProps({ Lines: newValue }, true);
    } else {
      throw new Error('Invalid type');
    }
  }

  static fillSingleValue(componentId, newValue) {
    if (!componentId) {
      return '';
    }

    const component = document.getElementById(componentId);

    if (component?.strangeValue) {
      component.strangeValue = newValue;
    } else if (component?.querySelector('select')) {
      component.querySelector('select').value = newValue;
    } else if (component?.querySelector('textarea')) {
      component.querySelector('textarea').value = newValue;
    } else if (component?.querySelector('input')) {
      component.querySelector('input').value = newValue;
    } else if (component?.querySelector('p')) {
      component.querySelector('p').innerText = newValue;
    }
  }

  static getCellsPerSizeVariant(sizeVariant) {
    return this.GRID.SIZE_PRESETS[sizeVariant];
  }

  static getSizeInPixelsPerSizeVariant(sizeVariant) {
    const cells = this.getCellsPerSizeVariant(sizeVariant);

    return {
      width: this.GRID.UNIT_SIZE.width * cells.horizontal + (cells.horizontal + 1) * this.GRID.gap,
      height: this.GRID.UNIT_SIZE.height * cells.vertical + (cells.vertical + 1) * this.GRID.gap,
    };
  }

  static getConfigPerVariant(variant) {
    return {
      ...this.getSizeInPixelsPerSizeVariant(variant),
      padding: this.GRID.padding,
      gap: this.GRID.gap,
      unitSize: this.GRID.UNIT_SIZE,
    };
  }

  static getComponentPageIndex(id) {
    const pages = pixelService.getPages();

    return pages.findIndex((page) => page.components.findIndex((component) => component.id === id));
  }

  static isGridPosEqual(c1, c2) {
    return (
      c1.rowStart === c2.rowStart &&
      c1.columnStart === c2.columnStart &&
      c1.rowEnd === c2.rowEnd &&
      c1.columnEnd === c2.columnEnd
    );
  }

  static isEqualComponents(grid1, grid2, props1, props2) {
    if (!grid1 || !grid2 || !props1 || !props2) {
      return false;
    }

    return PixelUtils.isGridPosEqual(grid1, grid2) && ObjectUtils.equals(props1, props2);
  }

  static extractValue(componentId) {
    if (!componentId) {
      return '';
    }

    const component = document.getElementById(componentId);
    const value =
      component?.strangeValue ??
      component?.querySelector('select')?.value ??
      component?.querySelector('textarea')?.value ??
      component?.querySelector('input')?.value ??
      component?.querySelector('p')?.innerText ??
      '';

    return value;
  }

  static getComponentDOMRef(componentId) {
    return document.getElementById(componentId);
  }

  /**
   * @param {[]} lines
   */
  static formatTableProps(lines) {
    const columns = Object.entries(lines[0]).map(([key, value], index) => {
      return { label: key, position: index + 1 };
    });

    const rowsEmptyLabels = new Array(lines.length).fill('').map((_, index) => {
      return { label: '', position: index + 1 };
    });

    return {
      columns: columns.length,
      rows: lines.length,
      columnsLabelList: columns,
      rowsLabelList: rowsEmptyLabels,
    };
  }
}
