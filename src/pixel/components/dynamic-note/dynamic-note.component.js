import { ComponentAdapter } from "../../dependencies/index.js";
import { loadRequirements } from "../../libs/at/core/index.js";
import { DynamicNote } from "../../dependencies/domain/dtos/index.js";
import template from "./dynamic-note.component.html";
import styles from "./dynamic-note.component.css";

export default class DynamicNoteComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.containerEl = this.querySelector('[data-id="container"]');
  }

  /**
   *@param  {DynamicNote} data
   */
  propsDidUpdate(data) {
    this.containerEl.innerHTML = data.template;
  }
}

customElements.define(DynamicNote.typeName, DynamicNoteComponent);
