import { ComponentAdapter } from "../../dependencies/index.js";
import { Button } from "../../dependencies/domain/dtos/index.js";
import template from "./button.component.html";
import styles from "./button.component.css";

export default class ButtonComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.componentId = this.getAttribute("id");
    this.buttonEl = this.querySelector("button");

    this.buttonEl.setAttribute("id", this.componentId);
  }

  /**
   *@param  {Button} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
    } = data;

    this.buttonEl.textContent = description;

    this.changeTextAlignment(textPosition, { description: this.buttonEl });
  }
}

customElements.define(Button.typeName, ButtonComponent);
