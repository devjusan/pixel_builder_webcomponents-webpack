import { ComponentAdapter } from "../../dependencies/index.js";
import { Date } from "../../dependencies/domain/dtos/index.js";
import template from "./date.component.html";
import styles from "./date.component.css";

export default class DateComponent extends ComponentAdapter {
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
   *@param  {Date} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
      default_value,
      is_required,
      ...rest
    } = data;

    Object.entries(rest).forEach(([key, value]) => {
      this.inputEl.setAttribute(key, value);
    });

    this.descriptionEl.textContent = description;
    this.inputEl.value = default_value;
    this.inputEl.required = is_required;

    this.changeTextAlignment(textPosition, { description: this.descriptionEl });
  }
}

customElements.define(Date.typeName, DateComponent);
