/* eslint-disable camelcase */
import { GroupComponentAdapter } from "../../dependencies/index.js";
import { ComponentsFactory } from "../../dependencies/factories/index.js";
import { Panel } from "../../dependencies/domain/dtos/index.js";
import template from "./panel.component.html";
import styles from "./panel.component.css";

export default class PanelComponent extends GroupComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit(data) {
    this.contentEl = this.querySelector(".sortable-container");

    this.propsDidUpdate(data);
    this.renderComponents(data.components);
  }

  /**
   * @param {Panel} data
   */
  propsDidUpdate(data) {
    const { border_color, border_width } = data;

    this.setBorder(border_color, border_width);
  }

  setBorder(color, width) {
    this.style.outline = `${width}px solid ${color}`;
  }

  renderComponents(components) {
    this.contentEl.innerHTML = "";
    components.forEach((component) => {
      this.contentEl.appendChild(
        ComponentsFactory.getGridComponentElement(component)
      );
    });
  }
}

customElements.define(Panel.typeName, PanelComponent);
