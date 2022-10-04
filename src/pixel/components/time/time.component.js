import { loadRequirements } from "../../libs/at/core/index.js";
import { ComponentAdapter } from "../../dependencies/index.js";
import { Time } from "../../dependencies/domain/dtos/index.js";
import template from "./time.component.html";
import styles from "./time.component.css";

export default class TimeComponent extends ComponentAdapter {
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
   *@param  {Time} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
      default_value,
      is_required,
    } = data;

    this.descriptionEl.textContent = description;
    this.inputEl.value = default_value;
    this.inputEl.required = is_required;

    this.changeTextAlignment(textPosition, { description: this.descriptionEl });
  }
}

customElements.define(Time.typeName, TimeComponent);
