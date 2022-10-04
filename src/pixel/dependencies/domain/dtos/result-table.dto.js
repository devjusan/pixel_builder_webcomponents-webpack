import { FullAlignment } from './shared.js';

export class BaseResultTable {
  static typeName = 'widget-result-table';

  /**
   * @param  {string} title
   * @param  {string} description
   * @param  {number} rows
   * @param  {number} columns
   * @param  {boolean} is_required
   * @param {{label: string, position: number}[]} rowsLabelList
   * @param {{label: string, position: number}[]} columnsLabelList
   */
  constructor(title, description, rows, columns, rowsLabelList, columnsLabelList) {
    this.title = title;
    this.description = description;
    this.rows = rows;
    this.columns = columns;
    this.rowsLabelList = rowsLabelList;
    this.columnsLabelList = columnsLabelList;
  }
}

export class ResultTable extends BaseResultTable {
  static typeName = 'widget-result-table';

  /**
   * @param  {FullAlignment} alignment
   * @param  {string} title
   * @param  {string} description
   * @param  {number} rows
   * @param  {number} columns
   * @param  {boolean} is_required
   */
  constructor(alignment, title, description, rows, columns, rowsLabelList, columnsLabelList) {
    super(title, description, rows, columns, rowsLabelList, columnsLabelList);
    this.alignment = Object.freeze(alignment);
  }
}
