export default class IconUtils {
  /**
   * @param  { string } icon
   * @param  { string } size
   * @param  { string } fillColor
   */
  static createIcon(icon, size, fillColor) {
    const iconEl = document.createElement('pixel-app-icon');

    iconEl.setAttribute('icon', icon ?? 'exchange-alt');
    iconEl.setAttribute('size', size ?? '15');
    iconEl.setAttribute('fill', fillColor ?? 'var(--color-secondary');

    return iconEl;
  }
}
