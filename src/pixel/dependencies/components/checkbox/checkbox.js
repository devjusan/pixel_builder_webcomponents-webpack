import { WebComponent } from "../../../libs/at/core/index.js";
import {
  AdvancedHandlersFactory,
  AdvancedHandlersFactoryEntry,
} from "../../domain/models/pixel/helpers/index.js";
import template from "./checkbox.html";
import styles from "./checkbox.css";

export default class CheckboxBlock extends WebComponent {
  get input() {
    return this.inputEl ?? this.querySelector("input");
  }

  set checked(checked) {
    this.inputEl.checked = checked;
  }

  get checked() {
    return this.inputEl.checked;
  }

  get customObservedAttributes() {
    return this.handlersFactory.keys();
  }

  onAttributeChanges(changes) {
    this.handlersFactory.resolve(changes);
  }

  constructor() {
    super(template, styles);
  }

  onInit() {
    this.labelEl = this.querySelector("label");
    this.inputEl = this.querySelector("input");
    this.tooltipEl = this.querySelector("app-tooltip");
    this.titleEl = this.querySelector("p");

    this.handlersFactory = new AdvancedHandlersFactory(this, [
      new AdvancedHandlersFactoryEntry("data-id", this.handleDataId),
      new AdvancedHandlersFactoryEntry("title", this.handleLabelTitle),
      new AdvancedHandlersFactoryEntry("disabled", this.handleDisabled),
      new AdvancedHandlersFactoryEntry(
        "input.checked",
        this.handleInputChecked
      ),
      new AdvancedHandlersFactoryEntry(
        "input.required",
        this.handleInputRequired
      ),
      new AdvancedHandlersFactoryEntry("input.id", this.handleInputId),
      new AdvancedHandlersFactoryEntry("input.name", this.handleInputName),
      new AdvancedHandlersFactoryEntry("input.value", this.handleInputValue),
      new AdvancedHandlersFactoryEntry("input.class", this.handleInputClass),
      new AdvancedHandlersFactoryEntry("with-tooltip", this.handleTooltip),
      new AdvancedHandlersFactoryEntry(
        "tooltip.outside-content",
        this.handleTooltipOutsideContent
      ),
      new AdvancedHandlersFactoryEntry(
        "tooltip.inside-content",
        this.handleTooltipInsideContent
      ),
      new AdvancedHandlersFactoryEntry(
        "tooltip.rounded",
        this.handleTooltipRounded
      ),
      new AdvancedHandlersFactoryEntry(
        "tooltip.orientation",
        this.handleTooltipOrientation
      ),
    ]);
  }

  handleDataId(changes) {
    const data = changes["data-id"].newValue;

    if (this.isFilled(data)) this.setAttribute("data-id", data);
    else this.removeAttribute("data-id");
  }

  handleLabelTitle(changes) {
    const title = changes["title"].newValue;

    if (this.isFilled(title)) this.titleEl.textContent = title;
    else this.titleEl.textContent = "";
  }

  handleDisabled(changes) {
    const disabled = changes["disabled"].newValue;

    if (this.isFilled(disabled)) {
      this.setAttribute("disabled", disabled);
    } else {
      this.removeAttribute("disabled");
    }
  }

  handleInputChecked(changes) {
    const inputChecked = changes["input.checked"].newValue;

    if (this.isFilled(inputChecked)) {
      this.inputEl.setAttribute("checked", inputChecked);
    } else {
      this.inputEl.removeAttribute("checked");
    }
  }

  handleInputRequired(changes) {
    const inputRequired = changes["input.required"].newValue;

    if (this.isFilled(inputRequired)) {
      this.inputEl.setAttribute("required", "required");
    } else {
      this.inputEl.removeAttribute("required");
    }
  }

  handleInputId(changes) {
    const inputId = changes["input.id"].newValue;

    if (this.isFilled(inputId)) this.inputEl.setAttribute("id", inputId);
    else this.inputEl.removeAttribute("id");
  }

  handleInputName(changes) {
    const inputName = changes["input.name"].newValue;

    if (this.isFilled(inputName)) this.inputEl.setAttribute("name", inputName);
    else this.inputEl.removeAttribute("name");
  }

  handleInputValue(changes) {
    const inputValue = changes["input.value"].newValue;

    if (this.isFilled(inputValue))
      this.inputEl.setAttribute("value", inputValue);
    else this.inputEl.removeAttribute("value");
  }

  handleInputClass(changes) {
    const inputClass = changes["input.class"].newValue;

    if (this.isFilled(inputClass))
      this.inputEl.setAttribute("class", inputClass);
    else this.inputEl.removeAttribute("class");
  }

  handleTooltip(changes) {
    const withTooltip = changes["with-tooltip"].newValue;

    if (this.isFilled(withTooltip)) {
      this.tooltipEl.setAttribute("with-tooltip", "with-tooltip");
      this.tooltipEl.style.display = "block";
    } else {
      this.tooltipEl.removeAttribute("with-tooltip");
      this.tooltipEl.style.display = "none";
    }
  }

  handleTooltipOutsideContent(changes) {
    const tooltipOutsideContent = changes["tooltip.outside-content"].newValue;

    if (this.isFilled(tooltipOutsideContent))
      this.tooltipEl.setAttribute("outside-content", tooltipOutsideContent);
    else this.tooltipEl.removeAttribute("outside-content");
  }

  handleTooltipInsideContent(changes) {
    const tooltipInsideContent = changes["tooltip.inside-content"].newValue;

    if (this.isFilled(tooltipInsideContent))
      this.tooltipEl.setAttribute("inside-content", tooltipInsideContent);
    else this.tooltipEl.removeAttribute("inside-content");
  }

  handleTooltipRounded(changes) {
    const tooltipRounded = changes["tooltip.rounded"].newValue;

    if (this.isFilled(tooltipRounded))
      this.tooltipEl.setAttribute("rounded", "rounded");
    else this.tooltipEl.removeAttribute("rounded");
  }

  handleTooltipOrientation(changes) {
    const tooltipOrientation = changes["tooltip.orientation"].newValue;

    if (this.isFilled(tooltipOrientation))
      this.tooltipEl.setAttribute("orientation", tooltipOrientation);
    else this.tooltipEl.removeAttribute("orientation");
  }

  isFilled(value) {
    return value !== null;
  }
}

customElements.define("app-pixel-checkbox-block", CheckboxBlock);
