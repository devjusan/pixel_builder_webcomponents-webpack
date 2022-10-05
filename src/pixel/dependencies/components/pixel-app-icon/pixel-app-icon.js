import { WebComponent } from "../../../libs/at/core/index.js";

const IconList = [
  "chev-arrow-left",
  "chev-arrow-right",
  "chevron-down",
  "star",
  "eye-purple",
  "delete-icon",
  "storage",
  "folder",
  "eye-off",
  "ordenate",
  "edit",
  "expand-arrows",
  "print",
  "wind-rose",
  "icon-close",
  "plus",
  "minus",
  "multiplication",
  "slash",
  "icon-minimize",
];

const parser = new DOMParser();

export default class AppIcon extends WebComponent {
  static get customObservedAttributes() {
    return ["icon", "size", "width", "height", "fill"];
  }

  constructor() {
    super();
    this.iconLoaded = false;
  }

  onAttributeChanges(changes) {
    if (changes.size || changes.width || changes.height) {
      if (changes.size) {
        this._iconSize = this.getAttribute("size") ?? "2rem";
      }

      if (changes.width) {
        this._iconWidth = this.getAttribute("width") ?? this._iconSize;
      }

      if (changes.height) {
        this._iconHeight = this.getAttribute("height") ?? this._iconSize;
      }
    }

    if (changes.fill) {
      this._iconFill =
        this.getAttribute("fill") ??
        "var(--fill-color, var(--color-secondary-dark))";
    }
  }

  componentDidMount() {
    import(`../../assets/${this.getAttribute("icon")}.svg`)
      .then((icon) => {
        const iconEl = icon.default;

        if (!iconEl) return document.createElement("svg");

        return iconEl;
      })
      .then((iconEl) => {
        this.innerHTML = iconEl;
        let svg = this.querySelector("svg");

        this.iconEl = svg;
        this.iconEl?.style?.setProperty("width", this._iconWidth);
        this.iconEl?.style?.setProperty("height", this._iconHeight);
        this.iconEl?.style?.setProperty("fill", this._iconFill);

        this.iconLoaded = true;
      });
  }
}

customElements.define("pixel-app-icon", AppIcon);
