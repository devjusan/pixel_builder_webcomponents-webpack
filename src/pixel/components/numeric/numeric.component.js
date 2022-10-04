import { ComponentAdapter } from "../../dependencies/index.js";
import { Numeric } from "../../dependencies/domain/dtos/index.js";
import template from "./numeric.component.html";
import styles from "./numeric.component.css";

export default class NumericComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.componentId = this.getAttribute("id");

    this.descriptionEl = this.querySelector("p");
    this.inputEl = this.querySelector("input");
    this.spanEl = this.querySelector("span");

    this.inputEl.setAttribute("id", this.componentId);
  }

  /**
   *@param  {Numeric} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
      default_value,
      min,
      max,
      is_required,
    } = data;

    this.descriptionEl.textContent = description;
    this.inputEl.value = default_value;
    this.inputEl.min = min;
    this.inputEl.max = max;
    this.inputEl.required = is_required;

    this.changeTextAlignment(textPosition, { description: this.descriptionEl });
  }
}

customElements.define(Numeric.typeName, NumericComponent);
