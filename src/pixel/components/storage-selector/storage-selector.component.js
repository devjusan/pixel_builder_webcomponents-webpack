import {
  ComponentAdapter,
  ComponentsFactory,
  IconUtils,
  localLoaderService,
  PixelUtils,
  StackNavigator,
  storagePixelService,
  StringUtils,
  UUIDUtils,
} from "../../dependencies/index.js";
import StorageTypes from "./types.js";
import { StorageSelector } from "../../dependencies/domain/dtos/index.js";
import { ListRenderControllerBuilder } from "../../libs/list-render/index.js";
import template from "./storage-selector.component.html";
import styles from "./storage-selector.component.css";

export default class StorageSelectorComponent extends ComponentAdapter {
  #FIRST_PAGE_NAME = "placeholder";

  constructor() {
    super(template, styles);
  }

  onInit() {
    this.titleEl = this.querySelector("h3");
    this.noteTextEl = this.querySelector("p");
    this.componentSlot = this.querySelector(".component-slot");
    this.stackList = this.querySelector(".stack-list");
    this.prevPageBtn = this.querySelector("#prev-page");
    this.nextPageBtn = this.querySelector("#next-page");
    this.minimizeEl = this.querySelector(".minimize");

    this.stackNavigator = new StackNavigator(this.stackList, [
      {
        screenEl: document.createElement("ul"),
        name: this.#FIRST_PAGE_NAME,
        payload: {},
      },
    ]);

    this.localLoaderInstance = localLoaderService.getInstance(this);
  }

  componentDidMount() {
    this.localLoaderInstance.setIsLoading();
    storagePixelService
      .getStoragesObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe({
        next: (storages) => this.renderFolders(storages),
        complete: () => this.localLoaderInstance.unsetIsLoading(),
      });

    this.stackNavigator
      .getActivePageObservable()
      .pipe(this.takeUntilLifeCycle())
      .subscribe((page) => {
        this.#handleDisableButton(page);
        if (page.name === this.#FIRST_PAGE_NAME) {
          return;
        }

        this.listRenderControllerContents
          ?.withTarget(page.screenEl)
          .build()
          .renderAsync(page.payload);
      });

    rxjs
      .fromEvent(this.prevPageBtn, "click")
      .pipe(this.takeUntilLifeCycle())
      .subscribe(() => this.stackNavigator.previousPage());

    rxjs
      .fromEvent(this.nextPageBtn, "click")
      .pipe(this.takeUntilLifeCycle())
      .subscribe(() => this.stackNavigator.nextPage());

    rxjs.fromEvent(this.minimizeEl, "click").subscribe(() => {
      this.classList.toggle("hide");
    });

    this.propagateListRenderController();
  }

  componentWillUnmount() {
    this.listRenderControllerStorages?.dispose?.();
    this.listRenderControllerContents?.dispose?.();
  }

  /**
   *  @param {StorageSelector} data
   */
  propsDidUpdate(data) {
    const { component, typeName, alignment } = data;

    this.configureComponentIfCan({ ...component, alignment }, typeName);
  }

  configureComponentIfCan(props, typeName) {
    if (!props || !typeName) {
      return;
    }

    if (this.#shouldRecreate(typeName)) {
      this.headerComponentEl = ComponentsFactory.getComponentElement(
        typeName,
        props
      );
      this.headerComponentTypename = typeName;

      if (this.componentSlot.hasChildNodes()) {
        this.componentSlot.innerHTML = "";
      }

      this.componentSlot.appendChild(this.headerComponentEl);
    }

    this.headerComponentEl.propsDidUpdate(props);
  }

  propagateListRenderController() {
    this.propagateListRenderControllerStorages();
    this.propagateListRenderControllerContents();
    this.propagateListRenderControllerFiles();
  }

  propagateListRenderControllerStorages() {
    this.listRenderControllerStorages = new ListRenderControllerBuilder()
      .withKeyExtractor(
        (item, index) =>
          (item.StorageID !== 0 && item.StorageID) ?? item.FolderID ?? index
      )
      .withItemCreator((item) => {
        const { StorageID, StorageName } = item;

        const li = document.createElement("li");
        const text = document.createTextNode(
          StringUtils.upperCaseFirstLetter(StorageName ?? item.FolderName)
        );
        const icon = IconUtils.createIcon("storage", "16", "#222");

        if (StorageID) {
          this.storageID = StorageID;
        }

        if (item.FolderID) {
          item.hasFolder = true;
          li.classList.add("has-item");
        } else {
          item.hasFolder = false;
        }

        li.appendChild(text);
        li.appendChild(icon);
        li.dataset.storageId = StorageID;

        return li;
      })
      .withOnAfterBindItem((itemEl, item, key) => {
        const { StorageID, FolderId } = item;

        const data = item.hasFolder
          ? { StorageID: this.storageID, FolderId: item.FolderID }
          : { StorageID, FolderId };

        const subscription = rxjs
          .fromEvent(itemEl, "click")
          .pipe(this.takeUntilLifeCycle())
          .subscribe(() => {
            const pageName = "page-" + key;
            const hasPage = this.stackNavigator.stack.find(
              (page) => page.name === pageName
            );

            if (hasPage) {
              this.stackNavigator.handleNavigate(pageName);
              return;
            }

            this.localLoaderInstance.setIsLoading();
            storagePixelService
              .getContentsObservable(data.StorageID, data.FolderId)
              .pipe(this.takeUntilLifeCycle())
              .subscribe({
                next: (contents) => this.setStack(contents, key),
                error: () => this.localLoaderInstance.unsetIsLoading(),
                complete: () => this.localLoaderInstance.unsetIsLoading(),
              });
          });

        return subscription;
      });
  }

  propagateListRenderControllerContents() {
    this.listRenderControllerContents = new ListRenderControllerBuilder()
      .withKeyExtractor((item, index) => item.key ?? index)
      .withItemCreator(() => {
        const itemEl = document.createElement("div");

        const foldersListEl = document.createElement("ul");
        const foldersTitleEl = document.createElement("h4");
        const filesListEl = document.createElement("ul");
        const filesTitleEl = document.createElement("h4");

        foldersTitleEl.innerText = "Pastas";
        filesTitleEl.innerText = "Arquivos";

        itemEl.appendChild(foldersTitleEl);
        itemEl.appendChild(foldersListEl);
        itemEl.appendChild(filesTitleEl);
        itemEl.appendChild(filesListEl);

        itemEl.foldersList = foldersListEl;
        itemEl.filesList = filesListEl;

        return itemEl;
      })
      .withOnAfterBindItem((itemEl, item) => {
        const { Files, Folders } = item;
        const { foldersList, filesList } = itemEl;

        this.listRenderControllerFiles
          .withTarget(filesList)
          .build()
          .renderAsync(Files);
        this.listRenderControllerStorages
          .withTarget(foldersList)
          .build()
          .renderAsync(Folders);
      });
  }

  propagateListRenderControllerFiles() {
    this.listRenderControllerFiles = new ListRenderControllerBuilder()
      .withKeyExtractor((item, index) => item.FileID ?? index)
      .withItemCreator((item) => {
        const { FileName } = item;

        const li = document.createElement("li");
        const text = document.createTextNode(
          StringUtils.upperCaseFirstLetter(FileName)
        );
        const icon = IconUtils.createIcon("folder", "13", "#222");

        li.classList.add("has-item");

        li.appendChild(text);
        li.appendChild(icon);

        return li;
      })
      .withOnAfterBindItem((itemEl, item) => {
        const subscription = rxjs
          .fromEvent(itemEl, "click")
          .pipe(this.takeUntilLifeCycle())
          .subscribe(this.onOpenFile.bind(this, item));

        return subscription;
      });
  }

  /**
   * @param {[]} storages
   */
  renderFolders(storages) {
    if (!this.mounted && !this.mounting) {
      return;
    }

    const firstPageContainerEl = document.createElement("div");

    this.stackNavigator.setStack(() => {
      const newStack = [
        {
          screenEl: firstPageContainerEl,
          name: this.#FIRST_PAGE_NAME,
          payload: {},
        },
      ];

      return [newStack, 0];
    });

    this.listRenderControllerStorages
      ?.withTarget(firstPageContainerEl)
      .build()
      .renderAsync(storages);
  }

  /**
   * @param {{}} contents
   * @param {number} key
   */
  setStack(contents, key) {
    const page = document.createElement("div");
    const pageName = `page-${key}`;
    const hasPage = this.stackNavigator.stack.find(
      (item) => item.name === pageName
    );
    let _stack = {};
    let newActiveI = 0;
    let newStack = [];
    this.stackNavigator.setStack((stack, activeI) => {
      if (hasPage) {
        _stack = hasPage;
        newActiveI = this.stackNavigator.stack.findIndex(
          (item) => item.name === pageName
        );
        newStack = [...stack];
      } else {
        _stack = { screenEl: page, name: pageName, payload: [contents] };
        newStack = [...stack, _stack];
        newActiveI = newStack.length - 1;
      }

      this.listRenderControllerContents
        ?.withTarget(page)
        .build()
        .renderAsync([contents]);

      return [newStack, newActiveI];
    });
  }

  /**
   * @param {{}} item
   */
  onOpenFile(item) {
    const data = { fileId: item.FileID };

    this.localLoaderInstance.setIsLoading();
    storagePixelService
      .openFile(data)
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.updateComponentProps.bind(this))
      .add(() => this.localLoaderInstance.unsetIsLoading());
  }

  /**
   * @param {[]} Lines
   */
  updateComponentProps({ Lines }, force = false) {
    const mappedLines = force
      ? Lines
      : Lines.map((objLine) => {
          const entries = Object.entries(objLine)
            .filter(([key, value]) => _.isNumber(value) || _.isString(value))
            .reduce((acc, [key, value]) => {
              acc[key] = StringUtils.sliceString(
                value,
                0,
                100,
                StringUtils.EFFECTS.POINTS
              );
              return acc;
            }, {});

          return entries;
        });

    const props = this.headerComponentEl.props;

    if (this.props.typeName === StorageTypes.types.RESULT_TABLE) {
      const formattedTableProps = PixelUtils.formatTableProps(mappedLines);
      this.headerComponentEl.propsDidUpdate({
        ...props,
        ...formattedTableProps,
      });
      this.headerComponentEl.withFillInputsValues(mappedLines);

      this.componentProps = mappedLines;
    } else if (this.props.typeName === StorageTypes.types.MAP) {
      const formattedTableProps = this.#formatMapProps(Lines);
      this.headerComponentEl.addEntriesList(formattedTableProps);

      this.componentProps = formattedTableProps;
    }
  }

  /**
   * @param {StackScreen} page
   */
  #handleDisableButton(page) {
    const stackListSize = this.stackNavigator.stack.length - 1;
    const lastPage = this.stackNavigator.stack[stackListSize];

    if (page.name === lastPage.name) {
      this.nextPageBtn.setAttribute("disabled", "disabled");
    } else {
      this.nextPageBtn.removeAttribute("disabled");
    }

    if (page.name === this.#FIRST_PAGE_NAME) {
      this.prevPageBtn.setAttribute("disabled", "disabled");
    } else {
      this.prevPageBtn.removeAttribute("disabled");
    }
  }

  /**
   * @param {[]} lines
   */
  #formatMapProps(lines) {
    return lines.map((line, index) => ({
      ...line,
      title:
        line.title ??
        line.tema ??
        line.nome ??
        line.nome1 ??
        line.classe ??
        `Geometria ${index + 1}`,
      value: line.geometry,
      key: UUIDUtils.getRandomId(),
    }));
  }

  /**
   * @param {string} typeName
   */
  #shouldRecreate(typeName) {
    return (
      !this.headerComponentTypename || this.headerComponentTypename !== typeName
    );
  }
}

customElements.define(StorageSelector.typeName, StorageSelectorComponent);
