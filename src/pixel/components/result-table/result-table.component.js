import { ResultTable } from "../../dependencies/domain/dtos/index.js";
import { ComponentAdapter } from "../../dependencies/index.js";
import template from "./result-table.component.html";
import styles from "./result-table.component.css";

export default class ResultTableComponent extends ComponentAdapter {
  /** @type {{body: string, head: string}} */
  #tableData;

  /** @type {number} */
  #rowCounter;

  #valuesList;

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
  }

  getInputList() {
    return this.inputList;
  }

  onInit() {
    this.titleEl = this.querySelector("h3");
    this.descriptionEl = this.querySelector("p");
    this.tableEl = this.querySelector("table");
  }

  /**
   *@param  {ResultTable} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition, contentPosition },
      title,
      description,
      rows,
      columns,
      columnsLabelList,
      rowsLabelList,
    } = data;

    this.titleEl.textContent = title;
    this.descriptionEl.textContent = description;

    this.renderTable({ rows, rowsLabelList }, { columns, columnsLabelList });
    this.changeTextAlignment(textPosition, {
      title: this.titleEl,
      description: this.descriptionEl,
    });

    const tableEls = Array.from(document.querySelectorAll("table tr > *"));
    this.changeContentAlignment(contentPosition, tableEls);
  }

  renderTable(rowsData, columnsData) {
    const { rows, rowsLabelList } = rowsData;
    const { columns, columnsLabelList } = columnsData;

    this.generateTableHead(this.tableEl, columns, columnsLabelList);
    this.generateTableBody(this.tableEl, rows, columns, rowsLabelList);
  }

  /**
   * @param {{[key:string]: string | number} | null} valuesList
   */
  withFillInputsValues(valuesList, force = false) {
    let converttedValues = valuesList
      ? valuesList.map((line) => {
          return Object.entries(line).map(([key, value]) => {
            return { value };
          });
        })
      : this.#withGetInputsValues();

    if (force) {
      converttedValues = valuesList;
    }

    this.valuesList = valuesList;
    this.converttedValues = converttedValues;

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

  generateTableHead(table, columns, columnsLabelList) {
    table.deleteTHead();

    const thead = table.createTHead();
    const row = thead.insertRow();
    const title = document.createElement("th");

    row.appendChild(title);

    this.tableDataHead = "";
    this.tableDataHeadList = [];
    for (let i = 1; i <= columns; i++) {
      const th = document.createElement("th");
      const columnValue =
        columnsLabelList?.find((column) => column.position === i)?.label ??
        `Coluna ${i}`;
      const text = document.createTextNode(columnValue);
      this.tableDataHead += `1&${i}&${columnValue};`;
      this.tableDataHeadList.push(columnValue);
      this.tableDataHeadSize = i;
      th.appendChild(text);
      row.appendChild(th);
    }
  }

  generateTableBody(table, rows, columns, rowsLabelList) {
    this.inputList = [];

    this.tableRowSize = 0;
    for (let i = 1; i <= rows; i++) {
      const row = table.insertRow();
      const title = document.createElement("th");
      const rowValue =
        rowsLabelList?.find((row) => row.position === i)?.label ?? `Linha ${i}`;
      const titleText = document.createTextNode(rowValue);

      title.appendChild(titleText);
      row.appendChild(title);
      this.inputList.push([]);
      this.tableDataRowSize = i;

      for (let j = 1; j <= columns; j++) {
        const cell = row.insertCell();
        const cellInput = document.createElement("input");

        cellInput.setAttribute("data-order", `${i}-${j}`);
        cellInput.value = "-";

        this.inputList[i - 1].push(cellInput);

        cell.appendChild(cellInput);
      }
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

customElements.define(ResultTable.typeName, ResultTableComponent);
