import { ComponentAdapter } from "../../dependencies/index.js";
import { MaskedInput } from "../../dependencies/domain/dtos/index.js";
import template from "./masked-input.component.html";
import styles from "./masked-input.component.css";

export default class MaskedInputComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);

    this.createInputMask = this.createInputMask.bind(this);
  }

  onInit() {
    this.componentId = this.getAttribute("id");

    this.descriptionEl = this.querySelector("p");
    this.inputEl = this.querySelector("input");

    this.inputEl.setAttribute("id", this.componentId);
  }

  /**
   *@param  {MaskedInput} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
      default_value,
      mask,
      is_required,
    } = data;

    this.descriptionEl.textContent = description;
    this.inputEl.value = default_value;
    this.inputEl.required = is_required;

    this.createInputMask(mask);

    this.changeTextAlignment(textPosition, { description: this.descriptionEl });
  }

  createInputMask(mask) {
    $(this.inputEl.id).mask(mask, {
      translation: {
        "@": {
          pattern: /[A-Za-z]/,
        },
        "#": {
          pattern: /\d/,
        },
        "*": {
          pattern: /[A-Za-z\d]/,
        },
      },
    });
  }
}

customElements.define(MaskedInput.typeName, MaskedInputComponent);
