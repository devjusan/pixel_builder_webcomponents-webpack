export class PixelProps {
  /** @typedef {{borderRadius: number; backgroundColor: string, headerColor: string; textColor: string; size: number}} Variant */

  /**
   * @param {string} title
   * @param {string} description
   * @param {string} iconName
   * @param {Variant} variant
   */
  constructor(title, description, iconName, variant) {
    /**@type {string} */
    this.title = title;
    /**@type {string} */
    this.description = description;
    /**@type {string} */
    this.iconName = iconName;
    /**@type {Variant} */
    this.variant = variant;
  }

  set(props) {
    const { title, description, iconName, variant } = { ...this, ...props };

    this.title = title;
    this.description = description;
    this.iconName = iconName;
    this.variant = { ...this.variant, ...variant };
  }

  fromJSON(props) {
    this.set(props);
  }
}
