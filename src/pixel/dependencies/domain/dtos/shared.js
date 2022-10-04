class TextAlignment {
  /** @param  {"text-left"|"text-center"|"text-right"} textPosition */
  constructor(textPosition) {
    this.textPosition = textPosition;
  }
}

class FullAlignment extends TextAlignment {
  /**
   * @param  {"text-left"|"text-center"|"text-right"} textPosition
   * @param  {"content-left"|"content-center"|"content-right"} contentPosition
   */
  constructor(textPosition, contentPosition) {
    super(textPosition);
    this.contentPosition = contentPosition;
  }
}

export { TextAlignment, FullAlignment };
