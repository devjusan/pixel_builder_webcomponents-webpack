import { TextAlignment } from './shared.js';

export class BaseDateTime {
  static typeName = 'widget-date-time';

  /**
   * @param  {'number'|'month'|'date'} type
   * @param  {'YYYY'|'MMMM-YYYY'|'DD-MM-YYYY'} date_format
   * @param  {string} description
   * @param  {string} date_default_value
   * @param  {string} time_default_value
   * @param  {boolean} is_required
   */
  constructor(description, type, date_format, date_default_value, time_default_value, is_required) {
    this.description = description;
    this.type = type;
    this.date_format = date_format;
    this.date_default_value = date_default_value;
    this.time_default_value = time_default_value;
    this.is_required = is_required;
  }
}

export class DateTime extends BaseDateTime {
  /**
   * @param  {TextAlignment} alignment
   * @param  {'number'|'month'|'date'} type
   * @param  {'YYYY'|'MMMM-YYYY'|'DD-MM-YYYY'} date_format
   * @param  {string} description
   * @param  {string} date_default_value
   * @param  {string} time_default_value
   * @param  {boolean} is_required
   */
  constructor(alignment, description, type, date_format, date_default_value, time_default_value, is_required) {
    super(description, type, date_format, date_default_value, time_default_value, is_required);
    this.alignment = Object.freeze(alignment);
  }
}
