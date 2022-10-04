import {
  pixelService,
  EntriesUtils,
  PixelComponent,
  PixelWorkflowStoreToken,
  toastService,
  ResponsesUtils,
  localLoaderService,
  PixelWorkflowFunction,
  PixelUtils,
  pixelTokenService,
} from '../index.js';

export default class PixelExecuteUtils {
  #REQUEST = { METHOD_TYPES: { POST: 'POST', GET: 'GET' }, HEADERS: { 'Content-Type': 'application/json' } };
  #ERRORS = {
    ERROR_EXECUTE: (routeName) => `Ocorreu um erro na execução da rota: ${routeName}`,
  };
  #DIVIDERS = { VARIABLE_DIVIDER: '.', FUNCTION_DIVIDER: '/' };

  /** @type {ResponsesUtils} */
  #responseInstance;

  constructor() {
    this.#responseInstance = new ResponsesUtils();
  }

  execute() {
    const { atStart, atEnd } = this.#functionsAtOrder();

    return new rxjs.Observable((subscriber) => {
      Promise.all(
        atStart.map(async (fn) => await this.#asyncFetch(fn.requestMethod, fn.url, fn.fieldEntriesMap, fn.id))
      ).finally(() => {
        if (atEnd.length) {
          this.#fillInputDependents(atEnd);

          return Promise.all(
            atEnd.map(async (fn) => await this.#asyncFetch(fn.requestMethod, fn.url, fn.fieldEntriesMap, fn.id))
          ).finally(() => this.#setEnd(subscriber));
        } else {
          this.#setEnd(subscriber);
        }
      });
    });
  }

  /**
   *
   * @returns {{atStart: PixelWorkflowFunction[], atEnd: PixelWorkflowFunction[]}}
   */
  #functionsAtOrder() {
    return pixelService.getWorkflow().functions.reduce(
      (acc, fn) => {
        const { fieldEntriesMap } = fn;
        const hasDependent = Object.values(fieldEntriesMap).some((entry) => entry.props?.dependentId);

        if (hasDependent) {
          acc.atEnd.push(fn);
        } else {
          acc.atStart.push(fn);
        }

        return acc;
      },
      { atStart: [], atEnd: [] }
    );
  }

  #fillMultipleOutcomes() {
    const { multipleOutcomesEntries } = pixelService.getWorkflow();

    for (let i = 0; i < multipleOutcomesEntries.length; i++) {
      const {
        component: { id },
      } = multipleOutcomesEntries[i];
      const componentEl = document.getElementById(id);
      const mentionsList = componentEl.querySelectorAll('[data-mention]');

      for (let j = 0; j < mentionsList.length; j++) {
        const element = mentionsList[j];
        const { mention } = element.dataset;
        const fnId = this.#getFunctionIdFromStageOutcome(mention);
        const field = this.#getVariableFromStageOutcome(mention);
        const value = this.#responseInstance.getUniqueResponseById(fnId)?.[field];
        element.innerHTML = JSON.stringify(value);
      }
    }
  }

  /**
   * @param {PixelWorkflowFunction[]} atEnd
   */
  #fillInputDependents(atEnd) {
    atEnd.forEach((fn) => {
      const { fieldEntriesMap } = fn;
      const entries = Object.values(fieldEntriesMap);

      entries.forEach((entry) => {
        const { props } = entry;
        if (props?.dependentId) {
          const dependentValue = PixelUtils.extractValue(props.dependentId);
          const componentEl = document.getElementById(entry?.id)?.querySelector('input');

          componentEl.value = dependentValue;
        }
      });
    });
  }

  /**
   * @param {'POST' | 'GET'} requestMethod
   * @param {string} url
   * @param {Object.<string, PixelComponent | PixelWorkflowStoreToken>} fieldEntriesMap
   * @param {string} fnId
   */
  async #asyncFetch(requestMethod, url, fieldEntriesMap, fnId) {
    let response;
    const data = EntriesUtils.getEntries(fieldEntriesMap);

    if (requestMethod === this.#REQUEST.METHOD_TYPES.POST) {
      response = await fetch(this.#replaceUrlParamsIfCan(url, data), {
        method: this.#REQUEST.METHOD_TYPES.POST,
        headers: this.#REQUEST.HEADERS,
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .catch();
    } else {
      response = await fetch(this.#replaceUrlParamsIfCan(url, data), {
        method: this.#REQUEST.METHOD_TYPES.GET,
        headers: this.#REQUEST.HEADERS,
      })
        .then((res) => res.json())
        .catch();
    }

    if (response?.message?.includes('error') || response?.error || response?.hasErrors) {
      this.#onError(url);
    }

    const filtredResponseEntries = this.#filtredResponseEntries(response);

    this.#responseInstance.setResponse(fnId, filtredResponseEntries);
    this.#fillComponentOutputs(filtredResponseEntries, fnId);
  }

  #fillComponentOutputs(filtredResponseEntries, fnId) {
    try {
      const entries = pixelService
        .getWorkflow()
        .singleOutcomeEntries.filter((entry) => entry.storeToken?.fn?.id === fnId);

      for (let index = 0; index < entries.length; index++) {
        const {
          component,
          storeToken: { field },
        } = entries[index];

        const componentEl = document.getElementById(component.id);
        const fieldLowered = field.toLowerCase();
        const fld = filtredResponseEntries[fieldLowered];
        const value = fld ? fld : 'Não encontrado';

        if (PixelUtils.isValidComponentWithInternalMap(componentEl)) {
          const internalMap = componentEl.querySelector('widget-map');
          if (Array.isArray(value)) {
            internalMap.addEntriesList(value);
            continue;
          }
          internalMap.addOrUpdateEntry({ key: value, value, title: 'Geom' });
        }
        if (PixelUtils.isValidComponentMap(component.typeName)) {
          if (Array.isArray(value)) {
            componentEl.addEntriesList(value);
            continue;
          }
          componentEl.addOrUpdateEntry({ key: value, value, title: 'Geom' });
        } else if (PixelUtils.isValidComponentTable(component.typeName)) {
          const handleValue = this.#handleValue(fld, filtredResponseEntries, fieldLowered, true);
          const cuttedValue = handleValue.map((v) => ({ [fieldLowered]: v }));

          componentEl.propsDidUpdate({ ...componentEl.props, ...PixelUtils.formatTableProps(cuttedValue) });
          componentEl.withFillInputsValues(cuttedValue);
        } else {
          const element = componentEl.querySelector('p');
          const handleValue = this.#handleValue(fld, filtredResponseEntries, fieldLowered);
          element.innerHTML = handleValue;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  #filtredResponseEntries(resp) {
    let data = Array.isArray(resp.objectResult) ? resp.objectResult[0] : resp.objectResult;

    if (!data) {
      return {};
    }

    if (Object.prototype.hasOwnProperty.call(data, 'scottJun2020')) {
      data = data.scottJun2020;
    }

    return this.#loweredItems(data);
  }

  #handleValue(value, responseEntries, fieldLowered, getArray) {
    const arrayList = this.#getResponseWithArray(responseEntries);

    if (value) {
      return value;
    } else if (arrayList?.length > 0) {
      return this.#bindResponseWithArray(arrayList, fieldLowered, getArray);
    } else {
      return 'Não encontrado';
    }
  }

  /**
   * @param {Array} arrayList
   * @param {string} fieldLowered
   */
  #bindResponseWithArray(arrayList, fieldLowered, getArray) {
    let arrayByField = [];
    for (let index = 0; index < arrayList.length; index++) {
      const array = arrayList[index];
      arrayByField.push(this.#findFieldRecursively(array, fieldLowered, getArray));
    }

    if (getArray) {
      return this.arrayPerField.flat();
    }

    this.arrayPerField = [];
    return arrayByField.flatMap((item) => item).join(', ');
  }

  /** @param {Object<string, any>} responseEntries */
  #getResponseWithArray(responseEntries) {
    let arrayList = [];
    for (const key in responseEntries) {
      if (Object.prototype.hasOwnProperty.call(responseEntries, key)) {
        const element = responseEntries[key];
        if (Array.isArray(element)) {
          arrayList.push(element);
        }
      }
    }

    return arrayList;
  }

  #findFieldRecursively(array, field, getArray) {
    if (!this.arrayPerField) {
      this.arrayPerField = [];
    }

    for (let index = 0; index < array.length; index++) {
      const element = array[index];

      if (element[field]) {
        if (getArray) {
          this.arrayPerField.push(array.map((item) => item[field]));
        } else {
          this.arrayPerField.push(this.#mapPerField(array, field));
        }
      } else {
        for (const key in element) {
          if (Object.prototype.hasOwnProperty.call(element, key)) {
            const value = element[key];
            if (Array.isArray(value)) {
              this.#findFieldRecursively(value, field, getArray);
            }
          }
        }
      }
    }

    return this.arrayPerField;
  }

  #mapPerField(array, field) {
    return array.map((item) => `<span style="display: block;">${field}: ${item[field]}</span>`);
  }

  /** @param {string} url */
  #onError(url) {
    const routeName = this.#extractRouteNameFromUrl(url);

    toastService.error(this.#ERRORS.ERROR_EXECUTE(routeName), 'Erro');
  }

  #setEnd(subscriber) {
    this.#fillMultipleOutcomes();
    subscriber?.next();
    subscriber?.complete();
    localLoaderService.unsetAll();
  }

  /**
   * @param {string} url
   */
  #extractRouteNameFromUrl(url) {
    const splittedUrl = url.split('/');
    let routeName;
    splittedUrl.forEach((item, i) => {
      if (item.includes('api')) {
        routeName = [...splittedUrl]
          .slice(i, i + 3)
          .join('-')
          .toUpperCase();
      }
    });

    return routeName;
  }

  /**
   * @param {string} url
   * @param {{}} params
   */
  #replaceUrlParamsIfCan(url, params) {
    let _url = this.#replaceToken(url);

    Object.entries(params).forEach((entry) => {
      let [key, value] = entry;

      if (_url.includes(key)) _url = _url.replace(`{${key}}`, value);
    });

    return _url;
  }

  /** @param {string} url */
  #replaceToken(url) {
    return url.replace('sua_chave_aqui', pixelTokenService.getToken());
  }

  /**
   * @param {{}} data
   */
  #loweredItems(data) {
    return Object.entries(data).reduce((acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    }, {});
  }

  /**
   * @param {string} string
   */
  #getFunctionIdFromStageOutcome(string) {
    return string?.split(this.#DIVIDERS.FUNCTION_DIVIDER)?.[0]?.substring(1);
  }

  /**
   * @param {string} string
   */
  #getVariableFromStageOutcome(string) {
    return string?.split(this.#DIVIDERS.FUNCTION_DIVIDER)?.[1]?.toLowerCase();
  }
}
