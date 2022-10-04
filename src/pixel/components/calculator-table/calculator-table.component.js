import {
  BaseCalculatorTable,
  CalculatorTable,
  CalculatorTableSelectedItemProps,
} from "../../dependencies/domain/dtos/index.js";
import {
  ArrayUtils,
  ComponentAdapter,
  IconUtils,
  pixelService,
  PixelUtils,
} from "../../dependencies/index.js";
import { ListRenderControllerBuilder } from "../../libs/list-render/list-render-controller.js";
import template from "./calculator-table.component.html";
import styles from "./calculator-table.component.css";

export default class CalculatorTableComponent extends ComponentAdapter {
  /** @typedef {'+' | '-' | '*' | '/'} OperatorProps */
  /** @typedef {{key: string, operator: OperatorProps, selectedItems: {text: string, id: string}[]}} SelectedItem */

  /**
   * @type {rxjs.BehaviorSubject}
   */
  #keyUpHandler;

  /**
   * @type {rxjs.BehaviorSubject}
   */
  #selectedItemsSubject;

  /**
   * @type {SelectedItem[]}
   */
  #selectedItems;

  /**
   * @type {rxjs.Subscription}
   */
  #keyUpSubscription;

  /** @type {{body: string, head: string}} */
  #tableData;

  /** @type {number} */
  #rowCounter;

  /** @type {number} */
  #valuesList;

  #ICONS = { RIGHT: "✓" };

  get tableData() {
    return this.#tableData;
  }

  set tableData(value) {
    this.#tableData = value;
  }

  get rowCounter() {
    return this.#rowCounter ?? 0;
  }

  set rowCounter(value) {
    this.#rowCounter = value;
  }

  get valuesList() {
    return this.#valuesList ?? [];
  }

  set valuesList(value) {
    this.#valuesList = value;
  }

  constructor() {
    super(template, styles);
    this.#keyUpHandler = new rxjs.BehaviorSubject([]);
    this.#selectedItemsSubject = new rxjs.BehaviorSubject([]);
    this.#selectedItems = [];
  }

  getInputList() {
    return this.inputList;
  }

  onInit() {
    this.titleEl = this.querySelector("h3");
    this.descriptionEl = this.querySelector("p");
    this.tableEl = this.querySelector("table");
  }

  componentDidMount() {
    this.#keyUpHandler
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.#handleKeyUpEvents.bind(this));

    this.listRenderControllerTableRows = new ListRenderControllerBuilder(
      this.tableEl
    )
      .withKeyExtractor((item, index) => item.key ?? index)
      .withItemCreator(this.handleItemCreator.bind(this))
      .withOnAfterBindItem(this.handleAfterBindItem.bind(this))
      .build();

    this.#selectedItemsSubject
      .pipe(this.takeUntilLifeCycle())
      .subscribe((selectedItems) => {
        this.renderTable(selectedItems);
      });
  }

  componentWillUnmount() {
    this.listRenderControllerTableRows?.dispose();
  }

  /**
   *@param  {CalculatorTable} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition, contentPosition },
      title,
      description,
      selectedItems,
    } = data;
    this.titleEl.textContent = title;
    this.descriptionEl.textContent = description;

    this.changeTextAlignment(textPosition, {
      title: this.titleEl,
      description: this.descriptionEl,
    });

    const tableEls = Array.from(document.querySelectorAll("table tr > *"));
    this.changeContentAlignment(contentPosition, tableEls);

    this.#selectedItems = selectedItems;
    this.renderTable(selectedItems);
    pixelService
      .getCompleteLoadObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(() => {
        this.#keyUpHandler.next(this.#selectedItems);
        this.#selectedItemsSubject.next(selectedItems);
      });
  }

  renderTable(selectedItems) {
    this.listRenderControllerTableRows?.render(
      ArrayUtils.chunk([...selectedItems], 3)
    );
  }

  /**
   * @param {{[key:string]: string | number} | null} valuesList
   */
  withFillInputsValues(valuesList) {
    const converttedValues = valuesList
      ? valuesList.map((line) => {
          return Object.entries(line).map(([key, value]) => {
            return { value };
          });
        })
      : this.#withGetInputsValues();

    this.valuesList = valuesList;

    this.tableData = { body: "", head: "", size: 0 };
    let tableData = "";
    for (let j = 0; j < converttedValues.length; j++) {
      const values = converttedValues[j];
      const inputs = this.inputList[j];
      for (let k = 0; k < values.length; k++) {
        const input = inputs[k];
        input.value = values[k].value;

        tableData += `${j + 2 + this.rowCounter}&${k + 1}&${input.value};`;
      }
    }

    this.tableData = {
      body: tableData,
      head: this.tableDataHead,
      size: this.tableDataHead.split(";").length,
    };
  }

  /**
   * @param {number} n
   */
  customInitialNumberTableHead(n) {
    const list = this.tableDataHead.split(";").map((line) => {
      const [row, column, name] = line.split("&");

      return `${row}&${Number(column) + Number(n)}&${name}`;
    });

    Array.prototype.pop.apply(list);

    return list.join(";") + ";";
  }
  /**
   *
   * @param {*} item
   * @returns
   */
  handleItemCreator(item) {
    const itemEl = document.createElement("tr");
    return itemEl;
  }

  /**
   *
   * @param {HTMLTableRowElement} itemEl
   * @param {SelectedItem[]} items
   * @returns
   */
  handleAfterBindItem(itemEl, items) {
    itemEl.innerHTML = "";
    for (let i = 0; i < items.length; i++) {
      const operationContainer = document.createElement("div");
      const operationResultEl = document.createElement("div");
      const item = items[i];
      const cell = itemEl.insertCell();

      const val = this.#calculateSelectedItem(item);
      const operation = this.#getOperation(item);
      operationContainer.appendChild(operation);
      operationResultEl.textContent = val;

      cell.appendChild(operationContainer);
      cell.appendChild(operationResultEl);
    }
  }

  /**
   * @param {{key: string, operator: OperatorProps, selectedItems: Array<{text: string, id: string}> }} selectedItem
   */
  #calculateSelectedItem(selectedItem) {
    if (!selectedItem) return;
    const { selectedItems, operator } = selectedItem;
    let value;
    switch (operator) {
      case BaseCalculatorTable.operatorType.addition:
        value = selectedItems.reduce(
          (acc, current) =>
            parseFloat(PixelUtils.extractValue(current.id)) + parseFloat(acc),
          0
        );
        break;
      case BaseCalculatorTable.operatorType.multiplication:
        value = selectedItems.reduce(
          (acc, current) =>
            parseFloat(parseFloat(acc) * PixelUtils.extractValue(current.id)),
          1
        );
        break;
      case BaseCalculatorTable.operatorType.subtraction:
        value = parseFloat(PixelUtils.extractValue(selectedItems[0].id));
        for (let i = 1; i < selectedItems.length; i++) {
          value -= parseFloat(PixelUtils.extractValue(selectedItems[i].id));
        }
        break;

      default:
        value = parseFloat(PixelUtils.extractValue(selectedItems[0].id));
        for (let i = 1; i < selectedItems.length; i++) {
          value /= parseFloat(PixelUtils.extractValue(selectedItems[i].id));
        }
        break;
    }

    return value.toFixed(2).replace(".00", "");
  }

  /**
   * @param {{key: string, operator: OperatorProps, selectedItems: Array<{text: string, id: string}> }} selectedItem
   */
  #getOperation(selectedItem) {
    if (!selectedItem) return;
    const { selectedItems } = selectedItem;
    const item = selectedItem;
    const spanCalc = document.createElement("span");
    spanCalc.classList.add("calculation-header");
    for (let i = 0; i < selectedItems.length; i++) {
      const text = document.createTextNode(
        selectedItems[i]?.text +
          "(" +
          PixelUtils.extractValue(selectedItems[i]?.id) +
          ")"
      );
      spanCalc.appendChild(text);
      if (i < selectedItems.length - 1) {
        spanCalc.appendChild(this.#handleCreateIcon(item?.operator));
      }
    }
    return spanCalc;
  }

  /**
   * @param {CalculatorTableSelectedItemProps[]} selectedItemsList
   */
  #handleKeyUpEvents(selectedItemsList) {
    for (let i = 0; i < selectedItemsList.length; i++) {
      const { selectedItems } = selectedItemsList[i];
      if (!selectedItems) continue;

      this.#handleExtractValue(selectedItems);
    }
  }

  /**
   * @param {Array<{text: string, id: number}>} selectedItems
   * @param {string} key
   */
  #handleExtractValue(selectedItems) {
    const { withEvent } = this.#extractSelectedItems(selectedItems);
    for (let i = 0; i < withEvent.length; i++) {
      const selectedItem = withEvent[i];
      const componentEl = PixelUtils.getComponentDOMRef(selectedItem.id);
      this.#bindKeyUpEvent(componentEl);
    }
  }

  /**
   * @param {Array<{text: string, id: number}>} selectedItems
   * @return {{withEvent: Array<{text: string, id: number}>, withoutEvent: Array<{text: string, id: number}>}}
   */
  #extractSelectedItems(selectedItems) {
    return selectedItems.reduce(
      (acc, selectedItem) => {
        const componentEl = PixelUtils.getComponentDOMRef(selectedItem.id);
        const hasInput = componentEl.querySelector("input");
        if (!hasInput) {
          acc.withoutEvent.push(selectedItem);
        } else {
          acc.withEvent.push(selectedItem);
        }
        return acc;
      },
      { withEvent: [], withoutEvent: [] }
    );
  }

  /**
   *
   * @param {HTMLElement} componentEl
   * @param {string} key
   * @returns
   */
  #bindKeyUpEvent(componentEl) {
    return rxjs
      .fromEvent(componentEl, "keyup")
      .pipe(
        rxjs.operators.debounceTime(250),
        rxjs.operators.distinctUntilChanged(),
        this.takeUntilLifeCycle()
      )
      .subscribe((e) => {
        this.#selectedItemsSubject.next([...this.#selectedItems]);
      });
  }

  #handleCreateIcon(operator) {
    if (BaseCalculatorTable.operatorType.addition === operator) {
      return IconUtils.createIcon("plus", 11);
    } else if (BaseCalculatorTable.operatorType.subtraction === operator) {
      return IconUtils.createIcon("minus", 11);
    } else if (BaseCalculatorTable.operatorType.multiplication === operator) {
      return IconUtils.createIcon("multiplication", 11);
    } else if (BaseCalculatorTable.operatorType.division === operator) {
      return IconUtils.createIcon("slash", 11);
    }
  }

  #withGetInputsValues() {
    const trs = Array.from(this.querySelectorAll("table thead tr"));
    const values = trs
      .map((tr) => {
        const inputs = Array.from(tr.querySelectorAll("input"));
        return inputs.map((input) => {
          return { value: input.value };
        });
      })
      .filter((inputs) => inputs.length > 0);

    return values;
  }
}

customElements.define(CalculatorTable.typeName, CalculatorTableComponent);
