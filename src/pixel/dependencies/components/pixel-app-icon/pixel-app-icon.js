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
const iconsMap = new Map();

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

      if (!changes.icon && this.iconLoaded) {
        this.refreshSize();
      }
    }

    if (changes.class) {
      this._iconClass = this.getAttribute("class");

      if (!changes.icon && this.iconLoaded) {
        this.refreshClass();
      }
    }

    if (changes.fill) {
      this._iconFill =
        this.getAttribute("fill") ??
        "var(--fill-color, var(--color-secondary-dark))";

      if (!changes.icon && this.iconLoaded) {
        this.refreshFill();
      }

      if (changes.icon) {
        this.refreshIcon();
      }
    }
  }

  refreshIcon() {
    this._loadIconSubscription?.unsubscribe();

    this.iconLoaded = false;
    this._loadIconSubscription = this.loadIcon(this.getAttribute("icon"))
      .pipe(this.takeUntilLifeCycle())
      .subscribe((iconEl) => {
        this.iconEl = iconEl.cloneNode(true);

        this.refreshSize();
        this.refreshClass();
        this.refreshFill();

        this.innerHTML = "";
        this.append(this.iconEl);

        this.iconLoaded = true;
      });
  }

  refreshSize() {
    this.iconEl?.style?.setProperty("width", this._iconWidth);
    this.iconEl?.style?.setProperty("height", this._iconHeight);
  }

  refreshFill() {
    this.iconEl?.style?.setProperty("fill", this._iconFill);
  }

  refreshClass() {
    this.iconEl?.setAttribute("class", this._iconClass);
  }

  loadIcon(iconName) {
    let iconObservable;
    if (!IconList.includes(iconName))
      throw new Error(`Icon ${iconName} not found`);

    if (!iconsMap.has(iconName)) {
      iconObservable = rxjs.fetch.fromFetch(this.#getIconPath(iconName)).pipe(
        rxjs.operators.mergeMap((res) => res.text()),
        rxjs.operators.map((iconStr) => {
          const iconEl = this.#strElementToHtmlElement(iconStr);
          iconEl.querySelectorAll("*").forEach((path) => {
            path.classList.remove("a");
          });

          iconsMap.set(iconName, rxjs.of(iconEl));

          return iconEl;
        }),
        rxjs.operators.shareReplay(1)
      );

      iconsMap.set(iconName, iconObservable);
    } else {
      iconObservable = iconsMap.get(iconName);
    }

    return iconObservable;
  }

  #getIconPath = (iconName) => {
    return `./assets/${iconName}.svg`;
  };

  #strElementToHtmlElement(strEl) {
    return parser.parseFromString(strEl, "text/html").querySelector("svg");
  }
}

customElements.define("pixel-app-icon", AppIcon);
