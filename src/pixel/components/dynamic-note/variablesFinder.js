export default class VariablesFinder {
  #variableQuery = '.mention';

  /**  @param  {HTMLElement} containerEl */
  constructor(containerEl) {
    this.containerEl = containerEl;
  }

  execute() {
    return Array.from(this.containerEl.querySelectorAll(this.#variableQuery));
  }
}
