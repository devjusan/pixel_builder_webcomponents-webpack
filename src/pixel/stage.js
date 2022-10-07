import template from "./stage.html";
import styles from "./stage.css";
import {
  pixelService,
  StackNavigator,
  PixelUtils,
  ComponentsFactory,
  PixelExecuteUtils,
  PixelExecuteReportUtils,
  modalsService,
  storagePixelService,
  PixelExecuteSaveUtils,
  eventBusService,
  toastService,
  pixelRepositoryService,
} from "./dependencies/index.js";
import { ModalAdapter } from "./dependencies/adapters/index.js";
import { localLoaderService } from "./dependencies/index.js";
import { ListRenderControllerBuilder } from "./libs/list-render/index.js";
import * as Rxjs from "rxjs";
import tokenService from "./dependencies/services/token.service";

export default class Stage extends ModalAdapter {
  /** @type {boolean} */
  #noModal;

  /**
   * @param {HTMLElement[]} elements
   */
  set headerActions(elements) {
    // new ListRenderControllerBuilder(this.actionsContainerEl)
    //   .withItemCreator((itemEl) => itemEl)
    //   .build()
    //   .render(elements);
  }

  set noModal(value) {
    this.#noModal = value;
  }

  get noModal() {
    return this.#noModal ?? false;
  }

  getEssentialsElements() {
    return {
      interactiveContainerEl: this.interactiveContainerEl,
      paginatorContainerEl: this.paginatorContainerEl,
      navigateNextBtn: this.nextPageBtn,
      navigatePrevBtn: this.prevPageBtn,
    };
  }

  constructor() {
    super(template, styles);
  }

  onInit() {
    this.headerEl = this.querySelector(".stage__header");
    this.paginationEl = this.querySelector("#pagination");
    this.activePageViewEl = this.querySelector("#pagination  #current-page");
    this.maxPageEl = this.querySelector("#pagination #max-page");
    this.nextPageBtn = this.querySelector("#pagination #next-page");
    this.prevPageBtn = this.querySelector("#pagination #prev-page");
    this.interactiveContainerEl = this.querySelector(".stage-container");
    this.paginatorContainerEl = this.querySelector(".stage-content-container");
    this.stackNavigator = new StackNavigator(this.paginatorContainerEl, [
      {
        screenEl: document.createElement("widget-page"),
        name: "placeholder",
        payload: {},
      },
    ]);
    this.localLoaderInstance = localLoaderService.getInstance(
      this.interactiveContainerEl
    );
    this.pixelExecuteInstance = new PixelExecuteUtils();

    this.localLoaderInstance.setIsLoading();

    tokenService.setToken(process.env.PIXEL_API_TOKEN);
    pixelRepositoryService
      .getPixelById(374)
      .pipe(this.takeUntilLifeCycle())
      .subscribe((pixel) => {
        pixelService.importPixelProject(pixel.body, "noModal", true);
        this.localLoaderInstance.unsetIsLoading();
      });
  }

  componentDidMount() {
    pixelService
      .getAddComponentObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.handleAddElement.bind(this));

    pixelService
      .getMoveThroughGroupsComponentObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.handleMoveThroughGroupsElement.bind(this));

    pixelService
      .getUpdateComponentPropsObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.handleUpdateElementProps.bind(this));

    pixelService
      .getUpdateComponentGridPosObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.handleUpdateElementGridPos.bind(this));

    pixelService
      .getRemoveComponentObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.handleDeleteElement.bind(this));

    pixelService
      .getActivePageObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.handleActivePage.bind(this));

    pixelService
      .getTotalPagesObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.refreshPagination.bind(this));

    pixelService
      .getPaginationObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.renderPaginationActions.bind(this));

    pixelService
      .getPropsObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.renderProps.bind(this));

    pixelService
      .getLoadComponentsObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.onLoad.bind(this));

    eventBusService
      .on("workflow:save-trigger:change")
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.handleSaveButtonId.bind(this));

    eventBusService
      .on("workflow:load-trigger:change")
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.handleLoadButtonId.bind(this));

    Rxjs.fromEvent(this.prevPageBtn, "click")
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.handlePrevPageNavigation.bind(this));

    Rxjs.fromEvent(this.nextPageBtn, "click")
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.handleNextPageNavigation.bind(this));

    this.reloadIfCan();
  }

  handleToggleContent() {
    this.toggleViewModeEl.classList.toggle("up");
    this.interactiveContainerEl.classList.toggle("invisible");
  }

  handleAddElement({ pageIndexOrGroupId, component }) {
    const element = ComponentsFactory.getGridComponentElement(component);

    if (typeof pageIndexOrGroupId === "number") {
      this.stackNavigator.stack[pageIndexOrGroupId].screenEl.addComponent(
        element
      );
    } else {
      const groupElement = document.getElementById(pageIndexOrGroupId);

      groupElement?.addComponent(element);
    }
  }

  handleMoveThroughGroupsElement({ pageIndexOrGroupId, component }) {
    const element = document.getElementById(component.id);
    element.setGridPos(component.gridPos);

    if (typeof pageIndexOrGroupId === "number") {
      this.stackNavigator.stack[pageIndexOrGroupId].screenEl.addComponent(
        element
      );
    } else {
      const groupElement = document.getElementById(pageIndexOrGroupId);

      groupElement?.addComponent(element);
    }
  }

  handleUpdateElementProps(component) {
    const element = document.getElementById(component.id);
    element.sync(component);
  }

  handleUpdateElementGridPos(component) {
    const element = document.getElementById(component.id);
    element.setGridPos(component.gridPos);
  }

  handleDeleteElement(id) {
    const element = document.getElementById(id);
    element?.remove();
  }

  onLoad(data) {
    const { props, paginator } = data;

    this.renderProps(props);
    this.renderPaginationActions({
      total: paginator.total,
      active: paginator.active,
    });
    this.refreshPagination(paginator);
    this.renderPaginationActions(paginator);
    this.renderComponents(paginator);
    this.#propagateSaveTriggerChange(
      pixelService.getWorkflow().saveTrigger?.id
    );
    this.#propagateLoadTriggerChange(
      pixelService.getWorkflow().loadTrigger?.id
    );
    pixelService.completeLoadNext();

    if (window.IS_PIXEL_BUILDER_ENV) {
      return;
    }

    this.bindSaveTrigger(props.title);
    this.bindTrigger();
    this.bindReports();
  }

  bindTrigger() {
    const triggerId = pixelService.getWorkflow().trigger?.id;
    const triggerEl = document.getElementById(triggerId);

    if (!triggerEl) {
      return;
    }

    Rxjs.fromEvent(triggerEl, "click")
      .pipe(
        Rxjs.mergeMap(() => {
          this.localLoaderInstance.setIsLoading();

          return this.pixelExecuteInstance.execute();
        }),
        this.takeUntilLifeCycle()
      )
      .subscribe();
  }

  bindSaveTrigger(title) {
    const triggerId = pixelService.getWorkflow().saveTrigger?.id;
    const triggerEl = document
      .getElementById(triggerId)
      ?.querySelector(".button");

    if (!triggerEl) {
      return;
    }

    Rxjs.fromEvent(triggerEl, "click")
      .pipe(
        Rxjs.mergeMap(() => this.#handleSaveTrigger(title)),
        this.takeUntilLifeCycle()
      )
      .subscribe({
        next: () => this.localLoaderInstance.unsetIsLoading(),
        complete: () => this.localLoaderInstance.unsetIsLoading(),
        error: () => this.localLoaderInstance.unsetIsLoading(),
      });
  }

  bindReports() {
    const reports = pixelService.getWorkflow().reports;

    for (let index = 0; index < reports.length; index++) {
      const report = reports[index];

      const reportTrigger = document.getElementById(report.trigger?.id);

      if (!reportTrigger) {
        continue;
      }

      const multiplicator = report.multiplicator ?? 1;
      const pixelExecuteReportInstance = new PixelExecuteReportUtils({
        report,
        multiplicator,
      });

      Rxjs.fromEvent(reportTrigger, "click")
        .pipe(
          Rxjs.tap(() => this.localLoaderInstance.setIsLoading()),
          Rxjs.mergeMap(() => pixelExecuteReportInstance.generateReport()),
          this.takeUntilLifeCycle()
        )
        .subscribe();
    }
  }

  handleSaveButtonId(id) {
    this.#removeAllSaveBtnChanges();

    if (!id) {
      return;
    }

    const button = document.getElementById(id);
    const buttonChangerComponent = document.createElement(
      "app-storage-selector"
    );

    button.classList.add("btn-changer");
    button.classList.add("pass-through-save");

    if (button.querySelector("app-storage-selector")) {
      button.removeChild(button.querySelector("app-storage-selector"));
    }

    button.prepend(buttonChangerComponent);
  }

  handleLoadButtonId(id) {
    this.#removeAllLoadBtnChanges();

    if (!id) {
      return;
    }

    const button = document.getElementById(id);
    const buttonChangerComponent = document.createElement(
      "app-storage-selector"
    );
    const titleEl = document.createElement("h3");

    button.classList.add("btn-changer");
    button.classList.add("pass-through-load");

    buttonChangerComponent.READ_ONLY = false;
    buttonChangerComponent.CB = PixelExecuteSaveUtils.executeLoad;
    titleEl.textContent = "Carregue o seu Pixel";

    if (button.querySelector("app-storage-selector")) {
      button.removeChild(button.querySelector("app-storage-selector"));
    }

    button.appendChild(titleEl);
    button.appendChild(buttonChangerComponent);
  }

  renderProps(props) {
    const {
      icon,
      title,
      description,
      variant: { borderRadius, backgroundColor, headerColor, textColor, size },
    } = props;

    this.changePixelSize(size);
    this.changePixelBorderRadius(borderRadius);
    this.changePixelBackgroundColor(backgroundColor);
    this.changePixelTextColor(textColor);
    this.changePixelHeaderBackgroundColor(headerColor);
  }

  changePixelSize(sizeVariant) {
    const { width, height, padding, gap, unitSize } =
      PixelUtils.getConfigPerVariant(sizeVariant);

    this.style.setProperty("width", `${width}px`);
    this.style.setProperty("--grid-gap", `${gap}px`);
    this.style.setProperty("--grid-padding", `${padding}px`);
    this.style.setProperty("--grid-cell-width", `${unitSize.width}px`);
    this.style.setProperty("--grid-cell-height", `${unitSize.height}px`);
    this.paginatorContainerEl.style.setProperty("height", `${height}px`);
    this.paginatorContainerEl.style.setProperty("width", `${width}px`);
  }

  changePixelBorderRadius(borderRadius) {
    this.interactiveContainerEl.style.setProperty(
      "border-radius",
      `0 0 ${borderRadius}px ${borderRadius}px`
    );
  }

  changePixelBackgroundColor(backgroundColor) {
    this.style.setProperty("--pixel-background-color", backgroundColor);
  }

  changePixelTextColor(textColor) {
    this.style.setProperty("--pixel-text-color", textColor);
  }

  changePixelHeaderBackgroundColor(headerColor) {
    this.style.setProperty("--pixel-header-background-color", headerColor);
  }

  renderPaginationActions(data) {
    const { active, total } = data;
    if (total > 1) {
      this.paginationEl.classList.remove("hidden");

      this.prevPageBtn.removeAttribute("disabled");
      this.nextPageBtn.removeAttribute("disabled");

      if (active === 0) {
        this.prevPageBtn.setAttribute("disabled", true);
      } else if (active === total - 1) {
        this.nextPageBtn.setAttribute("disabled", true);
      }
    } else {
      this.paginationEl.classList.add("hidden");
    }

    this.activePageViewEl.textContent = active + 1;
    this.maxPageEl.textContent = total;
  }

  refreshPagination(paginator) {
    const { active: activeIndex, pages } = paginator;
    if (!pages) {
      return;
    }

    this.stackNavigator.setStack((stack) => {
      const newStack = pages.map(
        (page) =>
          stack.find((stackTab) => stackTab.payload?.pageId === page.id) || {
            screenEl: document.createElement("widget-page"),
            name: page.id,
            payload: {
              pageId: page.id,
            },
          }
      );

      return [newStack, activeIndex];
    });
  }

  renderComponents(paginator) {
    paginator.pages.forEach(({ components }, index) =>
      components.forEach((component) =>
        this.handleAddElement({ component, pageIndexOrGroupId: index })
      )
    );
  }

  handleActivePage(page) {
    this.stackNavigator.handleNavigate(page.id);
  }

  handlePrevPageNavigation() {
    pixelService.paginatePrevious();
  }

  handleNextPageNavigation() {
    pixelService.paginateNext();
  }

  handleClosePixel() {
    if (window.IS_PIXEL_BUILDER_ENV) {
      return;
    }

    this.noModal ? this.remove() : modalsService.close();
  }

  reloadIfCan() {
    if (this.payload?.pixelJson) {
      pixelService.importPixelProject(this.payload.pixelJson);
    }
  }

  #handleSaveTrigger(title) {
    const time = new Date();
    const date = `${time.getFullYear()}_${
      time.getMonth() + 1
    }_${time.getDate()}`;
    const timeStamp = `${time.getHours()}_${time.getMinutes()}_${time.getSeconds()}`;
    const name = `${title}_${date}_${timeStamp}`
      .toString()
      .replace(".", "_")
      .replace(/\s/g, "_");

    return storagePixelService.getSelectedStorage().pipe(
      Rxjs.take(1),
      Rxjs.tap(() => this.localLoaderInstance.setIsLoading()),
      Rxjs.mergeMap((storage) =>
        PixelExecuteSaveUtils.executeSave().pipe(
          Rxjs.map((data) => ({
            fileContent: data,
            fileName: name,
            ...storage,
          }))
        )
      ),
      Rxjs.switchMap(({ fileContent, fileName, storageId, folderId }) => {
        if (!storageId || !folderId) {
          toastService.error(
            "Por favor, selecione um Storage e uma Pasta para salvar o pixel",
            "Erro"
          );
          return Rxjs.of(null);
        }
        return storagePixelService.uploadFile(
          fileName,
          fileContent,
          storageId,
          folderId
        );
      }),
      this.takeUntilLifeCycle()
    );
  }

  #propagateSaveTriggerChange(id) {
    eventBusService.emit("workflow:save-trigger:change", id);
  }

  #propagateLoadTriggerChange(id) {
    eventBusService.emit("workflow:load-trigger:change", id);
  }

  #removeAllSaveBtnChanges() {
    const btnChangers = this.querySelectorAll("widget-button");

    for (let index = 0; index < btnChangers.length; index++) {
      const btnChanger = btnChangers[index];

      if (btnChanger.classList.contains("pass-through-load")) {
        continue;
      }

      const storageSelector = btnChanger.querySelector("app-storage-selector");
      btnChanger.classList.remove("btn-changer");
      btnChanger.classList.remove("pass-through-save");
      storageSelector?.remove();
    }
  }

  #removeAllLoadBtnChanges() {
    const btnChangers = this.querySelectorAll("widget-button");

    for (let index = 0; index < btnChangers.length; index++) {
      const btnChanger = btnChangers[index];

      if (btnChanger.classList.contains("pass-through-save")) {
        continue;
      }

      const storageSelector = btnChanger.querySelector("app-storage-selector");
      btnChanger.classList.remove("btn-changer");
      btnChanger.classList.remove("pass-through-load");
      storageSelector?.remove();
    }
  }
}

customElements.define("widget-stage", Stage);
