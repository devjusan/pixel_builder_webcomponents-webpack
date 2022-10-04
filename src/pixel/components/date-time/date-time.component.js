import { ComponentAdapter } from "../../dependencies/index.js";
import { DateTime } from "../../dependencies/domain/dtos/index.js";
import template from "./date-time.component.html";
import styles from "./date-time.component.css";

export default class DateTimeComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.componentId = this.getAttribute("id");

    this.descriptionEl = this.querySelector("p");
    this.dateInputEl = this.querySelector("input.date-input");
    this.timeInputEl = this.querySelector("input.time-input");

    this.dateInputEl.setAttribute("id", `${this.componentId}-date`);
    this.timeInputEl.setAttribute("id", `${this.componentId}-time`);
  }

  /**
   *@param  {DateTime} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
      is_required,
      date_default_value,
      time_default_value,
      ...inputDateRest
    } = data;

    Object.entries(inputDateRest).forEach(([key, value]) => {
      this.dateInputEl.setAttribute(key, value);
    });

    this.descriptionEl.textContent = description;
    this.dateInputEl.value = date_default_value;
    this.timeInputEl.value = time_default_value;
    this.timeInputEl.required = is_required;
    this.dateInputEl.required = is_required;

    this.changeTextAlignment(textPosition, { description: this.descriptionEl });
  }
}

customElements.define(DateTime.typeName, DateTimeComponent);
