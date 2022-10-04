import { WebComponent } from "../../libs/at/core/index.js";
import { BasePanel } from "../../dependencies/domain/dtos/index.js";
import template from "./base-panel.component.html";
import styles from "./base-panel.component.css";

export default class BasePanelComponent extends WebComponent {
  constructor() {
    super(template, styles);
  }

  /**
   * @param  {BasePanel} data
   */
  propsDidUpdate(data) {
    const { border_color, border_width } = data;

    this.setBorder(border_color, border_width);
  }

  setBorder(color, width) {
    this.style.outline = `${width}px solid ${color}`;
  }
}

customElements.define(BasePanel.typeName, BasePanelComponent);
