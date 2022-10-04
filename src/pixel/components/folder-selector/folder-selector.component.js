import { ComponentAdapter } from "../../dependencies/index.js";
import { FolderSelector } from "../../dependencies/domain/dtos/index.js";
import template from "./folder-selector.component.html";
import styles from "./folder-selector.component.css";

export default class FolderSelectorComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.descriptionEl = this.querySelector("p");
    this.inputEl = this.querySelector("input");
    this.inputEl.setAttribute("id", this.componentId);
  }

  /**
   *@param  {FolderSelector} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
      is_required,
    } = data;

    this.descriptionEl.textContent = description;
    this.inputEl.required = is_required;

    this.changeTextAlignment(textPosition, { description: this.descriptionEl });
  }
}

customElements.define(FolderSelector.typeName, FolderSelectorComponent);
