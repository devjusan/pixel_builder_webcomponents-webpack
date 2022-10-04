import { StackNavigatorScreen } from "../../dependencies/index.js";
import template from "./page.html";
import styles from "./page.css";

export default class WidgetPage extends StackNavigatorScreen {
  constructor() {
    super(template, styles);
  }

  addComponent(component) {
    this.append(component);
  }
}

customElements.define("widget-page", WidgetPage);
