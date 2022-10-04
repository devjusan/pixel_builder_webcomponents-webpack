class UnhandledVariableError extends Error {
  /**
   * @param  {HTMLElement} element
   */
  constructor(element) {
    super("Couldn't interpret variable");
    console.error("Couldn't interpret following variable: ", element);
  }
}

export default class VariablesInterpreter {
  static variableMarker = '$';
  variableIdentifierAttribute = 'data-mention';

  /**
   * @param  {HTMLElement} element
   * @param  {string} newRawText
   */
  static refreshVariableText(element, newRawText) {
    element.textContent = this.#withVariableMarker(newRawText);
  }

  /**
   * @param  {string} str
   */
  static #withVariableMarker(str) {
    return this.variableMarker + str;
  }

  /**
   * @param  {HTMLElement[]} variablesEls
   */
  constructor(variablesEls) {
    this.variablesEls = variablesEls;
  }

  execute() {
    return this.variablesEls.map((variableEl) => {
      if (!variableEl.hasAttribute(this.variableIdentifierAttribute)) {
        throw new UnhandledVariableError(variableEl);
      }

      const rawValue = variableEl.getAttribute(this.variableIdentifierAttribute);
      const rawText = variableEl.textContent;
      const value = this.#withoutVariableMarker(rawValue);
      const text = this.#withoutVariableMarker(rawText);

      return { element: variableEl, rawText, rawValue, text, value };
    });
  }

  /**
   * @param  {string} str
   */
  #withoutVariableMarker(str) {
    return str.slice(VariablesInterpreter.variableMarker.length);
  }
}
