import { FullAlignment } from './shared.js';

export class BaseNote {
  static typeName = 'widget-note';

  /**
   * @param  {string} title
   * @param  {string} noteText
   */
  constructor(title, noteText) {
    this.title = title;
    this.noteText = noteText;
  }
}

export class Note extends BaseNote {
  /**
   * @param  {FullAlignment} alignment
   * @param  {string} title
   * @param  {string} noteText
   */
  constructor(alignment, title, noteText) {
    super(title, noteText);
    this.alignment = Object.freeze(alignment);
  }
}
