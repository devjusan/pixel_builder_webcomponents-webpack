import { loadRequirements } from "../../../../libs/at/core/index.js";
import { ListRenderControllerBuilder } from "../../../../libs/list-render/index.js";
import MapInitializer from "./../../../../components/map/map-initializer/map-initializer.js";
import { PLACEHOLDER } from "./map-component-helper.contants.js";
import { ModalAdapter } from "../../../index.js";
import template from "./map-component-helper.html";
import styles from "./map-component-helper.css";

export default class MapComponentHelperModal extends ModalAdapter {
  /** @typedef {{type: 'name' | 'stroke' | 'fill' | 'size', item: any, payload: any}} ConnectorType */

  /** @type {{name: string, item: any, key: string, subject: rxjs.BehaviorSubject<Array<ConnectorType>>, mapEl: MapInitializer}} */
  payload;

  constructor() {
    super(template, styles);
  }
  onInit() {
    this.containerListEl = this.querySelector(".map-component-helper-list");
    this.editBtnEl = this.querySelector(".edit-btn");
  }

  componentDidMount() {
    this.listRenderController = new ListRenderControllerBuilder(
      this.containerListEl
    )
      .withKeyExtractor((entry, index) => entry.key ?? index)
      .withItemCreator((entry) => {
        const item = document.createElement(entry.element);

        return item;
      })
      .withOnAfterBindItem((itemEl, item) => {
        const layer = this.payload.mapEl.getLayer(this.payload.item.title);

        if (layer) {
          this.#handleInputValue(itemEl, item, layer);
        }

        if (item.customAttributes) {
          for (let index = 0; index < item.customAttributes.length; index++) {
            const attribute = Object.entries(item.customAttributes[index])[0];

            const [key, value] = attribute;

            itemEl.setAttribute(key, value);
          }
        }

        item.name === "Nome" &&
          itemEl.setAttribute("input.value", this.payload.name);

        itemEl.setAttribute("title", item.name);
        itemEl.setAttribute("variant", "third");
        itemEl.setAttribute("input.for", item.name);
        itemEl.setAttribute("input.id", item.name);
        itemEl.setAttribute("input.name", item.name);
        itemEl.setAttribute("input.placeholder", item.placeholder);
        itemEl.setAttribute("input.type", item.inputType);
      })
      .build();

    this.listRenderController.render(PLACEHOLDER.LIST);

    rxjs
      .fromEvent(this.editBtnEl, "click")
      .pipe(this.takeUntilLifeCycle())
      .subscribe(() => {
        const placeholderList = Array.from(this.containerListEl.children).map(
          (element) => {
            const key =
              this.listRenderController.renderAdapter.extractKeyFromEl(element);
            const item = PLACEHOLDER.LIST.find((entry) => entry.key === key);

            return {
              ...item,
              value: this.payload.item.value,
              oldName: this.payload.name,
              key: this.payload.key,
              inputValue:
                item.name === "Sublinhado"
                  ? element.checked
                  : element.querySelector("input").value,
            };
          }
        );

        this.payload.subject.next(placeholderList);
        this.closeModal();
      });
  }

  #handleInputValue(itemEl, item, layer) {
    const style = layer.getStyle()[0];
    const stroke = style.getStroke();
    const fill = style.getFill();

    if (item.name === "Grossura") {
      itemEl.setAttribute("input.value", stroke.getWidth());
    } else if (item.name === "Cor da grossura") {
      itemEl.setAttribute(
        "input.value",
        this.#convertToRgbToHex(stroke.getColor())
      );
    } else if (item.name === "Cor interna") {
      itemEl.setAttribute(
        "input.value",
        this.#convertToRgbToHex(fill.getColor())
      );
    } else if (item.name === "Sublinhado") {
      itemEl.checked = stroke.getLineDash();
    } else {
      itemEl.setAttribute(
        "input.value",
        ol.color.asArray(fill.getColor()).slice()[3]
      );
    }
  }

  #convertToRgbToHex(rgba) {
    const convertedRgba = ol.color.asArray(rgba).slice();
    const rgb = `rgb(${convertedRgba[0]}, ${convertedRgba[1]}, ${convertedRgba[2]})`;

    return `#${this.#colorToHex(convertedRgba[0])}${this.#colorToHex(
      convertedRgba[1]
    )}${this.#colorToHex(convertedRgba[2])}`;
  }

  #colorToHex(color) {
    const hexadecimal = color.toString(16);

    return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
  }
}

customElements.define("app-map-component-helper", MapComponentHelperModal);
