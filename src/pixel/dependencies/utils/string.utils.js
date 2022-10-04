export default class StringUtils {
  constructor() {
    throw new Error('This class is static');
  }

  /**
   * @param {string} str
   * @returns string with first letter uppercase or any if not string
   */
  static upperCaseFirstLetter(str) {
    if (!_.isString(str)) {
      return str;
    }

    return str?.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * @param {string} str
   * @param {number} start
   * @param {number} end
   * @param {StringUtils.EFFECTS | null} effects
   * @returns sliced string or any if not string
   */
  static sliceString(str, start, end, effects = null) {
    if (!_.isString(str) || str?.length < end) {
      return str;
    }

    return str?.slice(start, end) + (effects || '');
  }

  static get EFFECTS() {
    return {
      POINTS: '...',
    };
  }
}
