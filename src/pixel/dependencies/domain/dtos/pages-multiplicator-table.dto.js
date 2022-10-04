import { FullAlignment } from './shared.js';

export class BasePagesMultiplicatorTable {
  static typeName = 'widget-pages-multiplicator-table';

  /**
   * @param  {string} title
   * @param  {string} description
   * @param  {number} multiplicator
   * @param  {number} rows
   * @param  {number} columns
   * @param  {boolean} is_required
   * @param {{label: string, position: number}[]} rowsLabelList
   * @param {{label: string, position: number}[]} columnsLabelList
   */
  constructor(title, description, multiplicator, rows, columns, rowsLabelList, columnsLabelList) {
    this.title = title;
    this.description = description;
    this.multiplicator = multiplicator;
    this.rows = rows;
    this.columns = columns;
    this.rowsLabelList = rowsLabelList;
    this.columnsLabelList = columnsLabelList;
  }
}

export class PagesMultiplicatorTable extends BasePagesMultiplicatorTable {
  static typeName = 'widget-pages-multiplicator-table';

  /**
   * @param  {FullAlignment} alignment
   * @param  {string} title
   * @param  {string} description
   * @param  {number} multiplicator
   * @param  {number} rows
   * @param  {number} columns
   * @param  {boolean} is_required
   * @param {{label: string, position: number}[]} rowsLabelList
   *  @param {{label: string, position: number}[]} columnsLabelList
   */
  constructor(alignment, title, description, multiplicator, rows, columns, rowsLabelList, columnsLabelList) {
    super(title, description, multiplicator, rows, columns, rowsLabelList, columnsLabelList);
    this.alignment = Object.freeze(alignment);
  }
}
