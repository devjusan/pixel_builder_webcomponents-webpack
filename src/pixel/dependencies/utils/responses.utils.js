export default class ResponsesUtils {
  constructor() {
    this.responses = new Map();
  }

  /**
   * @param {string} id
   * @param {any} response
   */
  setResponse(id, response) {
    this.responses.set(id, response);
  }

  getResponsesRepository() {
    return Array.from(this.responses.entries());
  }

  /**
   * @param {string} id
   */
  getUniqueResponseById(id) {
    return this.responses.get(id);
  }

  destroy() {
    this.responses.clear();
  }
}
