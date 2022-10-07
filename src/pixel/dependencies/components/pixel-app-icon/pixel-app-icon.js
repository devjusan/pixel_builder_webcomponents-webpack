import { WebComponent } from '../../../libs/at/core/index.js';

const IconList = [
  'chev-arrow-left',
  'chev-arrow-right',
  'chevron-down',
  'star',
  'eye-purple',
  'delete-icon',
  'storage',
  'folder',
  'eye-off',
  'ordenate',
  'edit',
  'expand-arrows',
  'print',
  'wind-rose',
  'icon-close',
  'plus',
  'minus',
  'multiplication',
  'slash',
  'icon-minimize',
];

export default class AppIcon extends WebComponent {
  static get customObservedAttributes() {
    return ['icon', 'size', 'width', 'height', 'fill'];
  }

  constructor() {
    super();
  }

  onAttributeChanges(changes) {
    if (changes.size || changes.width || changes.height) {
      if (changes.size) {
        this._iconSize = this.getAttribute('size') ?? '2rem';
      }

      if (changes.width) {
        this._iconWidth = this.getAttribute('width') ?? this._iconSize;
      }

      if (changes.height) {
        this._iconHeight = this.getAttribute('height') ?? this._iconSize;
      }
    }

    if (changes.fill) {
      this._iconFill = this.getAttribute('fill') ?? 'var(--fill-color, var(--color-secondary-dark))';
    }
  }

  componentDidMount() {
    if (!IconList.includes(this.getAttribute('icon'))) {
      // eslint-disable-next-line no-console
      console.error(`Icon ${this.getAttribute('icon')} not found. Please, check the icon name.`);
      return;
    }

    import(`../../assets/${this.getAttribute('icon')}.svg`)
      .then((icon) => {
        const iconEl = icon.default;

        if (!iconEl) return document.createElement('svg');

        return iconEl;
      })
      .then((_iconEl) => {
        this.innerHTML = _iconEl;
        const svg = this.querySelector('svg');

        svg?.style?.setProperty('width', this._iconWidth);
        svg?.style?.setProperty('height', this._iconHeight);
        svg?.style?.setProperty('fill', this._iconFill);
      });
  }
}

customElements.define('pixel-app-icon', AppIcon);
