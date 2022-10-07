import { WebComponent } from '../../../libs/at/core/index.js';
import { AdvancedHandlersFactory, AdvancedHandlersFactoryEntry } from '../../domain/models/pixel/helpers/index.js';
import template from './input.html';
import styles from './input.css';

export default class InputBlock extends WebComponent {
  set value(value) {
    this.inputEl.value = value;
  }

  get value() {
    return this.inputEl.value;
  }

  get customObservedAttributes() {
    return this.handlersFactory.keys();
  }

  onAttributeChanges(changes) {
    this.handlersFactory.resolve(changes);
  }

  constructor() {
    super(template, styles);

    this.handlersFactory = new AdvancedHandlersFactory(this, [
      new AdvancedHandlersFactoryEntry('variant', this.handleInputVariant),
      new AdvancedHandlersFactoryEntry('title', this.handleLabelTitle),
      new AdvancedHandlersFactoryEntry('label.for', this.handleLabelFor),
      new AdvancedHandlersFactoryEntry('input.id', this.handleInputId),
      new AdvancedHandlersFactoryEntry('input.value', this.handleInputValue),
      new AdvancedHandlersFactoryEntry('input.type', this.handleInputType),
      new AdvancedHandlersFactoryEntry('input.min', this.handleInputMin),
      new AdvancedHandlersFactoryEntry('input.max', this.handleInputMax),
      new AdvancedHandlersFactoryEntry('input.step', this.handleInputStep),
      new AdvancedHandlersFactoryEntry('input.name', this.handleInputName),
      new AdvancedHandlersFactoryEntry('input.class', this.handleInputClass),
      new AdvancedHandlersFactoryEntry('input.placeholder', this.handleInputPlaceholder),
      new AdvancedHandlersFactoryEntry('input.required', this.handleInputRequired),
      new AdvancedHandlersFactoryEntry('with-tooltip', this.handleTooltip),
      new AdvancedHandlersFactoryEntry('tooltip.outside-content', this.handleTooltipOutsideContent),
      new AdvancedHandlersFactoryEntry('tooltip.inside-content', this.handleTooltipInsideContent),
      new AdvancedHandlersFactoryEntry('tooltip.rounded', this.handleTooltipRounded),
      new AdvancedHandlersFactoryEntry('tooltip.orientation', this.handleTooltipOrientation),
    ]);
  }

  onInit() {
    this.labelEl = this.querySelector('.input__label');
    this.labelTitleEl = this.querySelector('.input__label h6');
    this.tooltipEl = this.querySelector('app-tooltip');
    this.inputEl = this.querySelector('.input__field');
  }

  handleInputVariant(changes) {
    /**
     * @type {'primary' | 'secondary' | 'third'} inputVariant
     */
    const inputVariant = changes['variant'].newValue;

    if (!this.isFilled(inputVariant)) {
      this.setAttribute('variant', 'primary');
    } else {
      this.setAttribute('variant', inputVariant);
    }
  }

  handleLabelTitle(changes) {
    const labelTitle = changes['title'].newValue;

    if (this.isFilled(labelTitle)) this.labelTitleEl.textContent = labelTitle;
    else this.labelTitleEl.textContent = '';
  }

  handleLabelFor(changes) {
    const labelFor = changes['label.for'].newValue;

    if (this.isFilled(labelFor)) this.labelEl.setAttribute('for', labelFor);
    else this.labelEl.removeAttribute('for');
  }

  handleInputId(changes) {
    const inputId = changes['input.id'].newValue;

    if (this.isFilled(inputId)) this.inputEl.setAttribute('id', inputId);
    else this.inputEl.removeAttribute('id');
  }

  handleInputValue(changes) {
    const inputValue = changes['input.value'].newValue;

    if (this.isFilled(inputValue)) this.inputEl.value = inputValue;
    else this.inputEl.value = '';
  }

  handleInputType(changes) {
    const inputType = changes['input.type'].newValue;

    this.inputEl.setAttribute('type', inputType);
  }

  handleInputMin(changes) {
    const inputMin = changes['input.min'].newValue;

    if (this.isFilled(inputMin)) this.inputEl.setAttribute('min', inputMin);
    else this.inputEl.removeAttribute('min');
  }

  handleInputMax(changes) {
    const inputMax = changes['input.max'].newValue;

    if (this.isFilled(inputMax)) this.inputEl.setAttribute('max', inputMax);
    else this.inputEl.removeAttribute('max');
  }

  handleInputStep(changes) {
    const inputStep = changes['input.step'].newValue;

    if (this.isFilled(inputStep)) this.inputEl.setAttribute('step', inputStep);
    else this.inputEl.removeAttribute('step');
  }

  handleInputName(changes) {
    const inputName = changes['input.name'].newValue;

    if (this.isFilled(inputName)) this.inputEl.setAttribute('name', inputName);
    else this.inputEl.removeAttribute('name');
  }

  handleInputClass(changes) {
    const inputClass = changes['input.class'].newValue;

    if (this.isFilled(inputClass)) this.inputEl.setAttribute('class', inputClass);
    else this.inputEl.removeAttribute('class');
  }

  handleInputPlaceholder(changes) {
    const inputPlaceholder = changes['input.placeholder'].newValue;

    if (this.isFilled(inputPlaceholder)) this.inputEl.setAttribute('placeholder', inputPlaceholder);
    else this.inputEl.removeAttribute('placeholder');
  }

  handleInputRequired(changes) {
    const inputRequired = changes['input.required'].newValue;

    if (this.isFilled(inputRequired)) this.inputEl.setAttribute('required', 'required');
    else this.inputEl.removeAttribute('required');
  }

  handleTooltip(changes) {
    const withTooltip = changes['with-tooltip'].newValue;

    if (this.isFilled(withTooltip)) {
      this.tooltipEl.setAttribute('with-tooltip', 'with-tooltip');
      this.tooltipEl.style.display = 'block';
    } else {
      this.tooltipEl.removeAttribute('with-tooltip');
      this.tooltipEl.style.display = 'none';
    }
  }

  handleTooltipOutsideContent(changes) {
    const tooltipOutsideContent = changes['tooltip.outside-content'].newValue;

    if (this.isFilled(tooltipOutsideContent)) this.tooltipEl.setAttribute('outside-content', tooltipOutsideContent);
    else this.tooltipEl.removeAttribute('outside-content');
  }

  handleTooltipInsideContent(changes) {
    const tooltipInsideContent = changes['tooltip.inside-content'].newValue;

    if (this.isFilled(tooltipInsideContent)) this.tooltipEl.setAttribute('inside-content', tooltipInsideContent);
    else this.tooltipEl.removeAttribute('inside-content');
  }

  handleTooltipRounded(changes) {
    const tooltipRounded = changes['tooltip.rounded'].newValue;

    if (this.isFilled(tooltipRounded)) this.tooltipEl.setAttribute('rounded', 'rounded');
    else this.tooltipEl.removeAttribute('rounded');
  }

  handleTooltipOrientation(changes) {
    const tooltipOrientation = changes['tooltip.orientation'].newValue;

    if (this.isFilled(tooltipOrientation)) this.tooltipEl.setAttribute('orientation', tooltipOrientation);
    else this.tooltipEl.removeAttribute('orientation');
  }

  isFilled = (value) => value !== null;
}

customElements.define('app-pixel-input-block', InputBlock);
