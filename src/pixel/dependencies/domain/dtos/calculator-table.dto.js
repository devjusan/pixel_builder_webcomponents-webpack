import { FullAlignment } from './shared.js';

export class CalculatorTableSelectedItemProps {
  /** @typedef {'+' | '-' | '*' | '/'} OperatorProps */

  /** 
   * @typedef {{key: string, operator: OperatorProps, selectedItems: {text: string, id: string}[]}} SelectedItemProps 
   * /

  /**  @param {SelectedItemProps} selectedItems  */
  constructor(selectedItems) {
    this.key = selectedItems.key;
    this.selectedItems = selectedItems.selectedItems;
    this.operator = selectedItems.operator;
  }
}

export class BaseCalculatorTable {
  static typeName = 'widget-calculator-table';
  static operatorType = {
    addition: '+',
    subtraction: '-',
    multiplication: '*',
    division: '/',
  };

  /**
   * @param  {string} title
   * @param  {string} description
   * @param {CalculatorTableSelectedItemProps[]} selectedItems
   */
  constructor(title, description, selectedItems) {
    this.title = title;
    this.description = description;
    this.selectedItems = selectedItems;
  }
}

export class CalculatorTable extends BaseCalculatorTable {
  static typeName = 'widget-calculator-table';

  /**
   * @param  {FullAlignment} alignment
   * @param  {string} title
   * @param  {string} description
   * @param {CalculatorTableSelectedItemProps[]} selectedItems
   */
  constructor(alignment, title, description, selectedItems) {
    super(title, description, selectedItems);
    this.alignment = Object.freeze(alignment);
  }
}
