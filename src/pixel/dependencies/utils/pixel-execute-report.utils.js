import {
  localLoaderService,
  pixelService,
  outputService,
  PixelWorkflowReport,
  PixelWorkflowReportEntry,
  PixelUtils,
  ArrayUtils,
} from "../index.js";

export default class PixelExecuteReportUtils {
  /** @typedef {{report: PixelWorkflowReport, multiplicator: number}} PixelExecuteData */
  multiplicator;
  report;

  /** @type {{PDF: 'pdf', BASE64: 'base64'}} */
  #FORMAT_TYPES = {
    PDF: "pdf",
    BASE64: "base64",
  };

  /** @type {number} */
  tableRowsSize = 0;

  /** @type {number} */
  tableRowsStrangeSize = 0;

  /** @type {number} */
  ROWS = 0;

  #MARKERS = { BREAKER: ";", TWO_POINTS: ":", E: "&" };

  /** @type {{idTemplate: number, format: 'pdf' | 'base64', parameters: string[] }} */
  #data;

  /** @type {HTMLInputElement[][]} */
  #childrens;

  /** @type {string[][]} */
  #descriptions;

  set data(data) {
    this.#data = data;
  }

  get data() {
    return this.#data;
  }

  set childrens(childrens) {
    this.#childrens = childrens;
  }

  get childrens() {
    return this.#childrens ?? [];
  }

  set descriptions(descriptions) {
    this.#descriptions = descriptions;
  }

  get descriptions() {
    return this.#descriptions;
  }

  get FORMAT_TYPES() {
    return this.#FORMAT_TYPES;
  }

  get MARKERS() {
    return this.#MARKERS;
  }

  /** @param {PixelExecuteData} */
  constructor({ report, multiplicator }) {
    this.report = {
      ...report,
      entries: report.entries.filter(
        (entry) => entry.token || entry.childrens.length > 0
      ),
    };
    this.multiplicator = multiplicator;
  }

  generateReport() {
    this.destroy();

    const idTemplate = this.report.externalId;
    const format = this.FORMAT_TYPES.BASE64;
    const parameters = this.#getPairVariableValue();

    this.data = { idTemplate, format, parameters };

    return outputService.generateOutput(this.data).pipe(
      rxjs.operators.map((response) => response.data),
      rxjs.operators.tap((data) => {
        const pdfName = `relatorio-${this.report.title}-${
          this.report.externalId
        }-${_.random(0, 1000)}`;
        this.#downloadPDF(data.base64, pdfName);
      }),
      rxjs.operators.tap(() => localLoaderService.unsetAll())
    );
  }

  destroy() {
    this.tableRowsSize = 0;
    this.ROWS = 0;
    this.data = null;
    this.childrens = [];
    this.descriptions = [];
  }

  #downloadPDF(pdf, flName) {
    const linkSource = `data:application/pdf;base64,${pdf}`;
    const downloadLink = document.createElement("a");
    const fileName = `${flName}.pdf`;

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  #getPairVariableValue() {
    const parameters = this.report.entries.map((entry) => {
      const variable = entry.title;

      if (entry.childrens.length > 0) {
        if (this.#isMap(entry)) {
          return this.#getPairMap(entry);
        } else if (this.#isTable(entry)) {
          return this.#getPairTable(entry);
        }

        return this.#getPairVariableTable(entry);
      }

      const value = PixelUtils.extractValue(entry.token?.id);
      const parameter = `${variable}${this.#MARKERS.TWO_POINTS}${value}`;

      return parameter;
    });

    return parameters;
  }

  /**
   * @param {PixelWorkflowReportEntry} entry
   */
  #getPairVariableTable(entry) {
    const { text: firstRow, COLUMNS } = this.#ensureChildrensFirstRow(entry);
    const { text: rows, ROWS } = this.#ensureChildrensRowsTable(entry);
    const tableSize = `${ROWS}x${COLUMNS}`;
    const variable = entry.title;
    const initialParam = `${variable}${this.MARKERS.TWO_POINTS}${tableSize}${this.MARKERS.BREAKER}`;

    const parameter = `${initialParam}${firstRow}${rows}`;

    return parameter;
  }

  /**
   * @param {PixelWorkflowReportEntry} entry
   */
  #getPairMap(entry) {
    const childrens = entry.childrens;

    let multipleParam = "";
    let component = null;
    let rows = 0;
    for (let j = 0; j < childrens.length; j++) {
      const child = childrens[j];
      component = document.getElementById(child.token.id);

      if (PixelUtils.isValidComponentWithInternalMap(component)) {
        component = component?.querySelector("widget-map");
      }

      const { text, size } = component.getPrintList(rows);

      rows += size;
      multipleParam += text;
    }

    const COLUMNS = 1;
    const ROWS = rows;
    const tableSize = `${ROWS}x${COLUMNS}`;
    const variable = entry.title;
    const initialParam = `${variable}${this.MARKERS.TWO_POINTS}${tableSize}${this.MARKERS.BREAKER}`;

    return `${initialParam}${multipleParam}`;
  }

  /**
   * @param {PixelWorkflowReportEntry} entry
   */
  #getPairTable(entry) {
    const childrens = entry.childrens;

    let multipleParam = "";
    let component = null;
    let rows = 0;
    let columns = 0;
    let inputListEl = [];
    let head = "";
    for (let j = 0; j < childrens.length; j++) {
      const child = childrens[j];
      component = document.getElementById(child.token.id);

      if (PixelUtils.isValidComponentWithInternalTable(component)) {
        component = component?.querySelector("widget-result-table");
        component.rowCounter = rows;
        component.withFillInputsValues(component.valuesList);
        inputListEl = component.getInputList();
      } else {
        component.rowCounter = rows;
        component.withFillInputsValues(null);
        inputListEl = component.getInputList();
      }

      rows += inputListEl.length;
      columns = component.tableData.size - 1;
      head = component.tableData.head;
      multipleParam += component.tableData.body;
    }

    const variable = entry.title;
    const tableSize = `${rows + 1}x${columns}`;
    const initialParam = `${variable}${this.MARKERS.TWO_POINTS}${tableSize}${this.MARKERS.BREAKER}${head}`;

    return `${initialParam}${multipleParam}`;
  }

  /**
   * @param {PixelWorkflowReportEntry} entry
   */
  #isMap(entry) {
    const childrens = entry.childrens;

    return childrens.every(
      (child) =>
        PixelUtils.isValidComponentMap(child.token?.typeName) ||
        PixelUtils.isValidComponentMap(child.token?.props?.typeName)
    );
  }

  /**
   * @param {PixelWorkflowReportEntry} entry
   */
  #isTable(entry) {
    const childrens = entry.childrens;

    return childrens.every(
      (child) =>
        PixelUtils.isValidComponentTable(child.token?.typeName) ||
        PixelUtils.isValidComponentTable(child.token?.props?.typeName)
    );
  }

  /**
   * @param {PixelWorkflowReportEntry} entry
   */
  #ensureChildrensFirstRow(entry) {
    const uniqChildrens = ArrayUtils.uniqBy(
      [...entry.childrens],
      (child) => child.text
    );
    const table =
      uniqChildrens
        .map(
          (child, index) =>
            `1${this.MARKERS.E}${index + 1}${this.MARKERS.E}${child.text}`
        )
        .join(this.MARKERS.BREAKER) + this.MARKERS.BREAKER;

    return { text: table, COLUMNS: uniqChildrens.length };
  }

  /**
   * @param {PixelWorkflowReportEntry} entry
   */
  #ensureChildrensRowsTable(entry) {
    const chunkedChildrens = ArrayUtils.chunk(
      [...entry.childrens],
      Math.ceil([...entry.childrens].length / pixelService.getMultiplicator())
    );

    const multipleParam =
      chunkedChildrens
        .map((childrens, i) =>
          childrens
            .map((child, j) => {
              const component = document.getElementById(child.token.id);
              let text = null;
              const isSelect = component?.querySelector("select");

              if (isSelect) {
                text = isSelect.options[isSelect.selectedIndex].value;

                if (Number(text[0])) {
                  text = text.split(".")[0];
                }
              } else {
                text =
                  component?.querySelector("textarea")?.value ??
                  component?.querySelector("input")?.value ??
                  component?.querySelector("p")?.innerText ??
                  "";
              }

              return `${i + 2}${this.MARKERS.E}${j + 1}${
                this.MARKERS.E
              }${text.replace(";", "")}`;
            })
            .join(this.MARKERS.BREAKER)
        )
        .join(this.MARKERS.BREAKER) + this.MARKERS.BREAKER;

    return { text: multipleParam, ROWS: chunkedChildrens.length + 1 };
  }

  /**
   * @param {number} j
   * @param {number} k
   */
  getValue(j, k) {
    const value =
      this.childrens[j]?.[k]?.value ??
      this.childrens[j]?.[k]?.innerText ??
      " - ";

    return value;
  }
}
