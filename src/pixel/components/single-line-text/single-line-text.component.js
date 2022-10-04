import { ComponentAdapter } from "../../dependencies/index.js";
import { SingleLineText } from "../../dependencies/domain/dtos/index.js";
import template from "./single-line-text.component.html";
import styles from "./single-line-text.component.css";

export default class SingleLineTextComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.componentId = this.getAttribute("id");

    this.descriptionEl = this.querySelector("p");
    this.inputEl = this.querySelector("input");
    this.inputEl.setAttribute("id", this.componentId);
  }

  /**
   *@param  {SingleLineText} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
      default_value,
      min_length,
      max_length,
      is_required,
    } = data;

    this.descriptionEl.textContent = description;
    this.inputEl.value = default_value;
    this.inputEl.minLength = min_length;
    this.inputEl.maxLength = max_length;
    this.inputEl.required = is_required;

    this.changeTextAlignment(textPosition, { description: this.descriptionEl });
  }
}

customElements.define(SingleLineText.typeName, SingleLineTextComponent);
