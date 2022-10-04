import { HttpClient } from '../../libs/at/http/index.js';
import { PixelComponent, PixelPage } from '../domain/index.js';
import { pixelService, toastService } from '../services/index.js';
import PixelUtils from './pixel.utils.js';

export default class PixelExecuteSaveUtils {
  static #EXCEPTION_LIST = ['widget-panel', 'widget-title', 'widget-button', 'widget-pages-multiplicator-table'];
  static #TYPES = {
    SINGLE: 'single',
    LIST: 'list',
  };

  /** @typedef {'single' | 'list'} Type */

  /** @typedef {{type: Type, value: any, componentId: string, gridPos: {columnEnd: number, columnStart: number, rowEnd: number, rowStart: number}, props: any }[]} SavedComponent */

  constructor() {
    throw new Error('PixelExecuteSaveUtils is static class');
  }

  /**
   * @param {{Url: string}} data
   */
  static executeLoad(data) {
    const { Url } = data;

    try {
      return HttpClient.get(Url)
        .pipe(
          rxjs.operators.observeOn(rxjs.asapScheduler),
          rxjs.operators.take(1),
          rxjs.operators.map((response) => response.data),
          rxjs.operators.switchMap((data) =>
            PixelExecuteSaveUtils.#replicate(data.multiplicator).pipe(
              rxjs.operators.finalize(() => PixelExecuteSaveUtils.#propagateLoad(data.list))
            )
          )
        )
        .subscribe();
    } catch (error) {
      console.error(error);
    }
  }

  /** @returns {{list: [SavedComponent[]], multiplicator: number}} */
  static executeSave() {
    try {
      const {
        paginator: { pages },
      } = pixelService.getPixel();

      /** @type {SavedComponent[]} */
      let savedComponents = [];
      /** @type {[SavedComponent[]]} */
      let savedData = [];

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const components = PixelExecuteSaveUtils.#filterComponents(page.getAllComponents(), this.#EXCEPTION_LIST);

        for (let j = 0; j < components.length; j++) {
          const component = components[j];
          const type = PixelExecuteSaveUtils.#extractType(component);
          const value = PixelExecuteSaveUtils.#extractValue(component, type);

          savedComponents.push({
            type,
            value,
            componentId: component.id,
            gridPos: component.gridPos,
            props: component.props,
          });
        }

        savedData.push(savedComponents);
        savedComponents = [];
      }

      return rxjs
        .of({ list: savedData, multiplicator: pixelService.getMultiplicator() })
        .pipe(rxjs.operators.observeOn(rxjs.asapScheduler));
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @param {[SavedComponent[]]} savedComponentList
   */
  static #propagateLoad(savedComponentList) {
    try {
      const {
        paginator: { pages },
      } = pixelService.getPixel();

      if (!PixelExecuteSaveUtils.#isCompatible(pages, savedComponentList)) PixelExecuteSaveUtils.#showError();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const components = PixelExecuteSaveUtils.#filterComponents(page.getAllComponents(), this.#EXCEPTION_LIST);

        for (let j = 0; j < components.length; j++) {
          const savedComponent = savedComponentList[i][j];
          const { gridPos, props } = components[j];

          if (!PixelUtils.isEqualComponents(gridPos, savedComponent?.gridPos, props, savedComponent?.props)) {
            PixelExecuteSaveUtils.#showError();
          }

          PixelExecuteSaveUtils.#fillValue(savedComponent, components, savedComponent?.value);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  static #replicate(multiplicator) {
    const componentEl = document.getElementById(PixelExecuteSaveUtils.#getMultiplicatorComponentId());

    return new rxjs.Observable((subscriber) => {
      if (componentEl) {
        pixelService.setMultiplicator(multiplicator);
        componentEl.replicate();

        componentEl.taskCompleted.subscribe(() => {
          subscriber.next();
          subscriber.complete();
        });
      } else {
        subscriber.next();
        subscriber.complete();
      }
    });
  }

  /**
   * @param {SavedComponent} savedComponent
   * @param {PixelComponent[]} components
   * @param {any} value
   */
  static #fillValue(savedComponent, components, value) {
    if (!savedComponent?.props || !savedComponent?.gridPos) {
      return PixelExecuteSaveUtils.#showError();
    }

    const component = components.find((component) =>
      PixelUtils.isEqualComponents(component.gridPos, savedComponent.gridPos, component.props, savedComponent.props)
    );

    if (!component) {
      return PixelExecuteSaveUtils.#showError();
    }

    const { id, typeName } = component;

    if (PixelUtils.isValidComponentWithArrayList(typeName)) {
      PixelUtils.fillArrayList(typeName, id, value);
    } else {
      PixelUtils.fillSingleValue(id, value);
    }
  }

  /**
   *
   * @param {PixelPage[]} pages
   * @param {[SavedComponent[]]} savedComponentList
   * @returns {boolean}
   */
  static #isCompatible(pages, savedComponentList) {
    if (!savedComponentList) {
      return false;
    }

    const pagesComponentSize = PixelExecuteSaveUtils.#filterComponents(
      pages.flatMap((page) => page.getAllComponents()),
      this.#EXCEPTION_LIST
    ).length;
    const savedComponentSize = savedComponentList.flatMap((savedComponent) => savedComponent).length;

    return pages.length === savedComponentList.length || pagesComponentSize === savedComponentSize;
  }

  /**
   * @param {Array<PixelComponent>} components
   * @param {Array<string>} exceptionList
   */
  static #filterComponents(components, exceptionList) {
    return components.filter((component) => {
      return !exceptionList.includes(component.typeName);
    });
  }

  /**
   * @param {PixelComponent} component
   * @param {Type} type
   */
  static #extractValue(component, type) {
    const { id, typeName } = component;

    if (type === this.#TYPES.SINGLE) {
      return PixelExecuteSaveUtils.#extractSingleValue(component);
    } else if (type === this.#TYPES.LIST) {
      return PixelExecuteSaveUtils.#extractMultipleValue(typeName, id);
    } else {
      throw new Error('Error: Invalid type.');
    }
  }

  /**
   * @param {PixelComponent} component
   * @returns {Type}
   */
  static #extractType(component) {
    const { typeName, id } = component;

    if (PixelUtils.isValidComponentWithArrayList(typeName, id)) {
      return this.#TYPES.LIST;
    } else {
      return this.#TYPES.SINGLE;
    }
  }

  /**
   * @param {PixelComponent} component
   */
  static #extractSingleValue(component) {
    const { id } = component;

    return PixelUtils.extractValue(id);
  }

  static #getMultiplicatorComponentId() {
    return pixelService
      .getPixel()
      .paginator.pages.flatMap((page) => page.getAllComponents())
      .find((component) => component.typeName === 'widget-pages-multiplicator-table').id;
  }

  /**
   * @param {string} typeName
   * @param {string} componentId
   */
  static #extractMultipleValue(typeName, componentId) {
    return PixelUtils.getArrayList(typeName, componentId);
  }

  static #showError() {
    toastService.warning(
      'Um ou mais componentes possuem propriedades divergentes da salvada no banco de dados. Tente salvar novamente.',
      'Erro'
    );
  }
}
