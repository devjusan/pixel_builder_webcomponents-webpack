import {
  ComponentAdapter,
  IconUtils,
  modalsService,
  UUIDUtils,
} from "../../dependencies/index.js";
import { Map } from "../../dependencies/domain/dtos/index.js";
import { ListRenderControllerBuilder } from "../../libs/list-render/index.js";
import "./map-initializer/map-initializer.js";
import { PLACEHOLDER } from "./map.constants.js";
import MapInitializer from "./map-initializer/map-initializer.js";
import template from "./map.component.html";
import styles from "./map.component.css";

export default class MapComponent extends ComponentAdapter {
  /** @typedef {{title: string, value: string, key: string}} EntriesList */

  /** @typedef {{title: string, value: string}} PrintList */

  /** @typedef {{type: 'name' | 'stroke' | 'fill' | 'size', key: string, item: any,payload: any}} ConnectorType */

  /** @type {rxjs.BehaviorSubject<Array<EntriesList>>} */
  #entries;

  /** @type {rxjs.BehaviorSubject<Array<PrintList>>} */
  #printList;

  /** @type {Array<PrintList>} */
  #mapPrintList;

  /** @type {boolean} */
  #hasError;

  /** @type {string | null} */
  #geoName;

  /** @type {number} */
  tableDataRowSize;

  /** @type {any} */
  strangeValue;

  /** @type {MapInitializer} */
  mapEl;

  /** @type {rxjs.BehaviorSubject<Array<ConnectorType>>} */
  connectorSubject;

  set tableList(list) {
    this.#mapPrintList = list;
  }

  get tableList() {
    return this.#mapPrintList ?? [];
  }

  constructor() {
    super(template, styles);

    this.tableDataRowSize = 0;
    this.#hasError = false;
    this.#geoName = null;
    this.strangeValue = null;

    this.printSubject = new rxjs.BehaviorSubject({ print: null, item: null });
    this.connectorSubject = new rxjs.BehaviorSubject({
      type: "name",
      key: null,
      payload: null,
    });
    this.#entries = new rxjs.BehaviorSubject([]);
    this.#printList = new rxjs.BehaviorSubject([]);
  }

  onInit() {
    this.entriesBoxEl = this.querySelector(".entries-box");
    this.entriesAddedList = this.querySelector(".entries-added-list");
    this.titleEl = this.querySelector("h1");
    this.hideBtnEl = this.querySelector(".hide-btn");
    this.mapDescEl = this.querySelector(".map-desc");
    this.mapEl = this.querySelector("app-map-initializer");
    this.printContainer = this.querySelector(".print-container");
    this.printEl = this.querySelector(".print");
    this.printContainerList = this.querySelector(".print-container-list");
    this.inputPrintNameEl = this.querySelector(".input-print-name");
    this.mapComponent = this.querySelector(".map-component");

    this.mapComponent.classList.add("scrollbar", "vertical", "horizontal");
  }

  componentDidMount() {
    this.listRenderControllerEntries = new ListRenderControllerBuilder(
      this.entriesAddedList
    )
      .withKeyExtractor((entry, index) => entry.key ?? index)
      .withItemCreator(() => {
        const itemEl = document.createElement("div");
        const title = document.createElement("span");
        const seeIconEl = IconUtils.createIcon("eye-purple", "15");
        const reorderIconEl = IconUtils.createIcon("ordenate", "15");
        const editIconEl = IconUtils.createIcon("edit", "15");
        const closeIconEl = IconUtils.createIcon("delete-icon", "15");

        itemEl.classList.add("entry-item");
        reorderIconEl.classList.add("ordenate");

        itemEl.appendChild(title);
        itemEl.appendChild(seeIconEl);
        itemEl.appendChild(reorderIconEl);
        itemEl.appendChild(editIconEl);
        itemEl.appendChild(closeIconEl);

        itemEl.removeEl = closeIconEl;
        itemEl.seeMapEl = seeIconEl;
        itemEl.titleEl = title;
        itemEl.editEl = editIconEl;

        return itemEl;
      })
      .withOnAfterBindItem((itemEl, item, key) => {
        const { removeEl, seeMapEl, titleEl, editEl } = itemEl;

        titleEl.textContent = item.title;
        titleEl.title = item.name ?? item.title;

        const subscription = rxjs
          .fromEvent(seeMapEl, "click")
          .pipe(this.takeUntilLifeCycle())
          .subscribe(() => {
            seeMapEl.classList.toggle("opacity");

            if (!seeMapEl.classList.contains("opacity")) {
              this.mapEl.removeLayer(item.title, item);
            } else {
              this.mapEl.approach(item);
            }
          });

        subscription.add(
          rxjs
            .fromEvent(removeEl, "click")
            .pipe(this.takeUntilLifeCycle())
            .subscribe(() => {
              this.mapEl.removeLayer(item.title);
              this.removeEntry(item);
            })
        );

        subscription.add(
          rxjs
            .fromEvent(editEl, "click")
            .pipe(this.takeUntilLifeCycle())
            .subscribe(() => {
              this.#geoName = item.title;

              modalsService.open("map-component-helper", {
                name: this.#geoName,
                key,
                subject: this.connectorSubject,
                item,
                mapEl: this.mapEl,
              });
            })
        );

        return subscription;
      })
      .build();

    this.listRenderControllerPrint = new ListRenderControllerBuilder(
      this.printContainerList
    )
      .withKeyExtractor((item, index) => item.key ?? index)
      .withItemCreator(() => {
        const itemEl = document.createElement("div");
        const textEl = document.createElement("span");
        const printIconEl = IconUtils.createIcon("print", "15");
        const seeIconEl = IconUtils.createIcon("eye-purple", "15");
        const closeIconEl = IconUtils.createIcon("delete-icon", "15");

        itemEl.classList.add("entry-item");

        itemEl.appendChild(textEl);
        itemEl.appendChild(printIconEl);
        itemEl.appendChild(seeIconEl);
        itemEl.appendChild(closeIconEl);

        itemEl.textEl = textEl;
        itemEl.addPrintEl = printIconEl;
        itemEl.seeMapEl = seeIconEl;
        itemEl.removeEl = closeIconEl;

        return itemEl;
      })
      .withOnAfterBindItem((itemEl, item, key) => {
        const { removeEl, seeMapEl, textEl, addPrintEl } = itemEl;

        textEl.textContent = item.title;

        const subscription = rxjs
          .fromEvent(seeMapEl, "click")
          .pipe(this.takeUntilLifeCycle())
          .subscribe(() => {
            this.printSubject.next({ print: item.print, item });
          });

        rxjs
          .fromEvent(addPrintEl, "click")
          .pipe(
            rxjs.operators.mergeMap(() => this.mapEl.print()),
            this.takeUntilLifeCycle()
          )
          .subscribe((print) => {
            this.printSubject.next({ print, item });
          });

        subscription.add(
          rxjs
            .fromEvent(removeEl, "click")
            .pipe(this.takeUntilLifeCycle())
            .subscribe(() => {
              this.removePrint(key);
            })
        );
        return subscription;
      })
      .build();

    rxjs
      .fromEvent(this.hideBtnEl, "click")
      .pipe(this.takeUntilLifeCycle())
      .subscribe(() => {
        this.classList.toggle("hide-component");
        this.#handleBtnDescription();
      });

    rxjs
      .fromEvent(this.printEl, "click")
      .pipe(this.takeUntilLifeCycle())
      .subscribe(() => {
        this.addOrUpdatePrint({
          key: UUIDUtils.getRandomId(),
          value: null,
          title: this.inputPrintNameEl.value,
        });
      });

    rxjs
      .fromEvent(this.inputPrintNameEl, "keyup")
      .pipe(rxjs.operators.debounceTime(100), this.takeUntilLifeCycle())
      .subscribe((event) => {
        const { value } = event.target;
        this.#handlePrintBtn(value);
      });

    this.#entries
      .asObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.renderEntries.bind(this));
    this.connectorSubject
      .asObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.propagateEdits.bind(this));
    this.printSubject
      .asObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.propagatePrint.bind(this));
    this.#printList
      .asObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.renderPrints.bind(this));

    this.#handlePrintBtn("");
    this.#sortableItems();
  }

  componentWillUnmount() {
    this.listRenderController?.dispose?.();
    this.listRenderControllerEntries?.dispose?.();
    this.listRenderControllerPrint?.dispose?.();

    this.printSubject.complete();
    this.connectorSubject.complete();
  }

  /**
   *@param {Map} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
      entriesType,
    } = data;

    this.titleEl.textContent = description;

    this.handleEntriesBox(entriesType);
    this.changeTextAlignment(textPosition, { description: this.titleEl });
  }

  /** @param {EntriesList[]} entries */
  renderEntries(entries) {
    if (!this.mounted && !this.mounting) {
      return;
    }

    this.entriesList = entries;
    this.listRenderControllerEntries?.render(entries);
    this.mapEl.updateLayersIndex();
  }

  /** @param {ConnectorType[]} connectors */
  propagateEdits(connectors) {
    if (!this.mounted && !this.mounting) {
      return;
    }

    if (!Array.isArray(connectors)) {
      return;
    }

    const values = [...connectors]
      .filter((item) => item.type !== "name")
      .map((item) => item.inputValue);
    const titleConnector = connectors.find((item) => item.type === "name");
    this.mapEl.changeLayerName(titleConnector, titleConnector.inputValue);

    this.addOrUpdateEntry({
      ...titleConnector,
      title: titleConnector.inputValue,
    });
    this.#geoName = titleConnector.inputValue;
    this.mapEl.changeLayerStyle(
      { ...titleConnector, title: titleConnector.inputValue },
      values[0],
      values[1],
      values[2],
      values[3],
      values[4]
    );
  }

  propagatePrint({ print, item }) {
    if (!this.mounted && !this.mounting) {
      return;
    }

    if (!print) {
      this.printContainer.src = "";

      return;
    }

    this.strangeValue = print;
    this.addOrUpdatePrint({ ...item, value: print });
    const src = `data:image/png;base64,${print}`;
    this.printContainer.src = src;
  }

  /**
   *@param {"geom" | "coords"} entriesType
   */
  handleEntriesBox(entriesType) {
    switch (entriesType) {
      case "coords":
        this.renderInputs(PLACEHOLDER.COORDS);
        break;
      case "geom":
        this.renderInputs(PLACEHOLDER.GEOM);
        break;
    }
  }

  /** @param {Array<T>} items */
  renderInputs(items) {
    if (!this.mounted && !this.mounting) {
      return;
    }

    if (!this.listRenderController)
      this.listRenderController = new ListRenderControllerBuilder()
        .withKeyExtractor((entry, index) => entry.key ?? entry.id ?? index)
        .withItemCreator((entry) => {
          const item = document.createElement(entry.element);

          return item;
        })
        .withOnAfterBindItem((itemEl, item, key) => {
          item.value && itemEl.setAttribute("input.value", item.value);
          item.classNames && itemEl.classList.add(...item.classNames);

          if (item.name === "Nome da geometria") {
            rxjs
              .fromEvent(itemEl.querySelector("input"), "input")
              .pipe(this.takeUntilLifeCycle())
              .subscribe((e) => {
                this.#geoName = e.target.value;
              });
          }

          if (item.element === "p") {
            itemEl.textContent = item.name;
            return;
          }

          if (item.element === "span") {
            itemEl.textContent = item.name;

            const subscription = rxjs
              .fromEvent(itemEl, "click")
              .pipe(this.takeUntilLifeCycle())
              .subscribe(() => {
                this.#handleError();
                !this.#hasError && this.addOrUpdateEntry(this.#getInputs());
              });

            return subscription;
          }

          itemEl.setAttribute("title", item.name ?? item.title);
          itemEl.setAttribute("variant", "third");
          itemEl.setAttribute("input.for", item.name ?? item.title);
          itemEl.setAttribute("input.id", item.name) ?? item.title;
          itemEl.setAttribute("input.name", item.name ?? item.title);
          itemEl.setAttribute("input.placeholder", item.placeholder);
        });

    this.listRenderController
      ?.withTarget(this.entriesBoxEl)
      .build()
      .render(items);
  }

  /** @param {PrintList[]} prints */
  renderPrints(prints) {
    if (!this.mounted && !this.mounting) {
      return;
    }

    this.tableList = prints;
    this.tableDataRowSize = prints.length;
    this.listRenderControllerPrint.render(prints);
  }

  /** @param {EntriesList} item */
  addOrUpdateEntry(item) {
    if (this.#hasError) {
      return;
    }

    this.#entries
      .pipe(rxjs.operators.take(1), this.takeUntilLifeCycle())
      .subscribe((entries) => {
        const index = entries.findIndex((entry) => entry.key === item.key);
        const newEntries = [...entries];

        if (index === -1) {
          newEntries.push(item);
        } else {
          newEntries[index] = item;
        }

        this.#entries.next(newEntries);
      });
  }

  /** @param {EntriesList} item */
  removeEntry(item) {
    this.#entries
      .pipe(rxjs.operators.take(1), this.takeUntilLifeCycle())
      .subscribe((entries) => {
        const newEntries = entries.filter((entry) => entry.key !== item.key);
        this.#entries.next(newEntries);
        this.mapEl.removeLegend(item);
      });
  }

  /** @param {EntriesList[]} newEntries */
  addEntriesList(newEntries) {
    const mapNewEntries = newEntries.map((entry) => ({
      ...entry,
      value: entry.value ?? entry.geometry ?? entry.geom,
      title: entry.title ?? entry.nomeTema ?? entry.nome,
    }));

    this.#entries
      .pipe(rxjs.operators.take(1), this.takeUntilLifeCycle())
      .subscribe((entries) => {
        this.#entries.next([...entries, ...mapNewEntries]);
      });
  }

  /** @param {PrintList} print */
  addOrUpdatePrint(print) {
    this.#printList
      .pipe(rxjs.operators.take(1), this.takeUntilLifeCycle())
      .subscribe((prints) => {
        const printIndex = prints.findIndex((l) => l.key === print.key);
        const newPrints = [...prints];

        if (printIndex === -1) {
          newPrints.push(print);
        } else {
          newPrints[printIndex] = print;
        }

        this.#printList.next(newPrints);
      });
  }

  removePrint(key) {
    this.printSubject.next({ print: null, item: null });

    this.#printList
      .pipe(rxjs.operators.take(1), this.takeUntilLifeCycle())
      .subscribe((prints) => {
        const newPrints = prints.filter((item) => item.key !== key);

        this.#printList.next(newPrints);
      });
  }

  getPrintList(rows) {
    const prints = [...this.tableList];
    const stringList = prints.reduce((acc, item) => {
      acc.push(item.title);
      acc.push(item.value);

      return acc;
    }, []);
    const toRelatory = stringList.map(
      (item, index) => `${index + 1 + rows}&1&${item}`
    );

    return { text: toRelatory.join(";") + ";", size: toRelatory.length };
  }

  #sortableItems() {
    $(this.entriesAddedList).sortable({
      containment: this.entriesAddedList,
      tolerance: "pointer",
      axis: "y",
      stop: (event, ui) => this.#upgradeAccordionListOrderIfCan(ui.item[0]),
      handle: ".ordenate",
    });
  }

  /** @param {HTMLElement} itemEl */
  #upgradeAccordionListOrderIfCan(itemEl) {
    if (!itemEl) {
      return;
    }
    const key =
      this.listRenderControllerEntries.renderAdapter.extractKeyFromEl(itemEl);
    const index =
      this.listRenderControllerEntries.renderAdapter.getIndexByKey(key);

    this.#moveItemToIndexByKey(key, index);
  }

  /**
   * @param {string} key
   * @param {number} index
   */
  #moveItemToIndexByKey(key, index) {
    this.#entries
      .pipe(rxjs.operators.take(1), this.takeUntilLifeCycle())
      .subscribe((entries) => {
        if (index > entries.length - 1 || index === -1) return;

        const item = entries.find((entry) => entry.key === key);
        const newEntries = [...entries].filter((entry) => entry.key !== key);

        newEntries.splice(index, 0, item);
        this.#entries.next(newEntries);
      });
  }

  #getInputs() {
    return Array.from(this.entriesBoxEl.querySelectorAll("input")).reduce(
      (acc, curInput) => {
        const { value, name } = curInput;
        const LONGITUDE = "Longitude";
        const LATITUDE = "Latitude";

        if (name === LONGITUDE || name === LATITUDE) {
          return {
            ...acc,
            key: UUIDUtils.getRandomId(),
            title: this.#geoName,
            value: [...acc.value, parseFloat(value)],
          };
        }

        return {
          ...acc,
          title: this.#geoName,
          value,
          key: UUIDUtils.getRandomId(),
        };
      },
      { value: [] }
    );
  }

  #handleBtnDescription() {
    this.hideBtnEl.textContent = this.classList.contains("hide-component ")
      ? "Mostrar entradas"
      : "Ocultar entradas";
  }

  #handleError() {
    this.#hasError = Array.from(
      this.entriesBoxEl.querySelectorAll("input")
    ).some((input) => input.value === "");
    const container = this.querySelector(".error-container");

    if (this.#hasError) {
      container.classList.add("on-error", "show-error");
      setTimeout(
        () => container.classList.remove("on-error", "show-error"),
        5000
      );
    }

    return this.#hasError;
  }

  #handlePrintBtn(value) {
    if (value.length > 0) {
      this.printEl.removeAttribute("disabled");
    } else {
      this.printEl.setAttribute("disabled", "true");
    }
  }
}

customElements.define(Map.typeName, MapComponent);
