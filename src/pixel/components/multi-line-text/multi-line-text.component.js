import { ComponentAdapter } from "../../dependencies/index.js";
import { MultiLineText } from "../../dependencies/domain/dtos/index.js";
import template from "./multi-line-text.component.html";
import styles from "./multi-line-text.component.css";

export default class MultiLineTextComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.componentId = this.getAttribute("id");

    this.descriptionEl = this.querySelector("p");
    this.textareaEl = this.querySelector("textarea");
    this.textareaEl.setAttribute("id", this.componentId);
  }

  /**
   *@param  {MultiLineText} data
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
    this.textareaEl.value = default_value;
    this.textareaEl.minLength = min_length;
    this.textareaEl.maxLength = max_length;
    this.textareaEl.required = is_required;

    this.changeTextAlignment(textPosition, { description: this.descriptionEl });
  }
}

customElements.define(MultiLineText.typeName, MultiLineTextComponent);
