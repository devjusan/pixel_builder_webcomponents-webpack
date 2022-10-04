import { ComponentAdapter } from "../../dependencies/index.js";
import { SingleChoice } from "../../dependencies/domain/dtos/index.js";
import template from "./single-choice.component.html";
import styles from "./single-choice.component.css";

export default class SingleChoiceComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.componentId = this.getAttribute("id");

    this.descriptionEl = this.querySelector("p");
    this.radioInputsContainer = this.querySelector("#input-container");
    this.radioInputsContainer.setAttribute("id", this.componentId);
  }

  /**
   *@param  {SingleChoice} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
      is_required,
      options,
    } = data;

    this.descriptionEl.textContent = description;
    this.radioInputsContainer.required = is_required;
    this.renderSelectOptions(options);
    this.changeTextAlignment(textPosition, { description: this.descriptionEl });
  }

  renderSelectOptions(options) {
    this.radioInputsContainer.innerHTML = "";
    options.forEach((text, i) =>
      this.radioInputsContainer.append(this.createOptionEl(text, i === 0))
    );
  }

  createOptionEl(text, checked) {
    const labelEl = document.createElement("label");
    const spanEl = document.createElement("span");
    const inputRadioEl = document.createElement("input");

    spanEl.classList.add("check-mark");
    inputRadioEl.setAttribute("type", "radio");
    inputRadioEl.setAttribute("id", text);
    inputRadioEl.setAttribute("name", this.componentId);
    inputRadioEl.setAttribute("value", text);
    if (checked) inputRadioEl.setAttribute("checked", true);

    labelEl.append(inputRadioEl);
    labelEl.append(spanEl);
    labelEl.append(text);

    return labelEl;
  }
}

customElements.define(SingleChoice.typeName, SingleChoiceComponent);
