import { ComponentAdapter } from "../../dependencies/index.js";
import { DropdownList } from "../../dependencies/domain/dtos/index.js";
import template from "./dropdown-list.component.html";
import styles from "./dropdown-list.component.css";

export default class DropdownListComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.componentId = this.getAttribute("id");

    this.descriptionEl = this.querySelector("p");
    this.selectEl = this.querySelector("select");

    this.selectEl.setAttribute("id", this.componentId);
    this.selectEl.setAttribute("name", this.componentId);
  }

  /**
   *@param  {DropdownList} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
      is_required,
      options,
    } = data;

    this.descriptionEl.textContent = description;
    this.selectEl.required = is_required;

    this.renderSelectOptions(options);

    this.changeTextAlignment(textPosition, { description: this.descriptionEl });
  }

  renderSelectOptions(options) {
    this.selectEl.innerHTML = "";
    options.forEach((text) => this.selectEl.append(this.createOptionEl(text)));
  }

  createOptionEl(text) {
    const optionEl = document.createElement("option");
    optionEl.setAttribute("value", text);
    optionEl.innerText = text;

    return optionEl;
  }
}

customElements.define(DropdownList.typeName, DropdownListComponent);
