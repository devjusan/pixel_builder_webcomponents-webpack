import { WebComponent } from "../../../libs/at/core/index.js";
import {
  localLoaderService,
  StackNavigator,
  StringUtils,
  IconUtils,
  storagePixelService,
  toastService,
} from "../../index.js";
import { ListRenderControllerBuilder } from "../../../libs/list-render/index.js";
import template from "./storage-selector.html";
import styles from "./storage-selector.css";

export default class StorageSelector extends WebComponent {
  #FIRST_PAGE_NAME = "placeholder";

  /** @typedef {rxjs.BehaviorSubject<{storageName: string, storageId: number, folderId: number} | {}> } SelectedStorage */

  /** @type {SelectedStorage} */
  #selectedStorage;

  /** @type {boolean} */
  #readOnly = true;

  /** @type {(...any) => any} */
  #cb = (...data) => data;

  set READ_ONLY(value) {
    this.#readOnly = value;
  }

  get READ_ONLY() {
    return this.#readOnly ?? true;
  }

  set CB(value) {
    this.#cb = value;
  }

  get CB() {
    return this.#cb ?? (() => {});
  }

  constructor() {
    super(template, styles);

    this.#selectedStorage = new rxjs.BehaviorSubject({});
  }

  onInit() {
    this.containerListEl = this.querySelector(".stack-list");
    this.prevPageBtn = this.querySelector("#prev-page");
    this.nextPageBtn = this.querySelector("#next-page");
    this.selectedStorageTitle = this.querySelector(".selected-storage");

    this.stackNavigator = new StackNavigator(this.containerListEl, [
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

    this.#selectedStorage
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.#handleSelectedStorage.bind(this));

    rxjs
      .fromEvent(this.prevPageBtn, "click")
      .pipe(this.takeUntilLifeCycle())
      .subscribe(() => this.stackNavigator.previousPage());

    rxjs
      .fromEvent(this.nextPageBtn, "click")
      .pipe(this.takeUntilLifeCycle())
      .subscribe(() => this.stackNavigator.nextPage());

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

    this.propagateListRenderController();
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

            this.#selectedStorage.next({
              storageName: item.StorageName ?? item.FolderName,
              storageId: this.storageID,
              folderId: item.FolderId ?? item.FolderID,
            });

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

        this.listRenderControllerStorages
          .withTarget(foldersList)
          .build()
          .renderAsync(Folders);
        this.listRenderControllerFiles
          .withTarget(filesList)
          .build()
          .renderAsync(Files);
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

        li.title = item.FileName;
        li.classList.add("has-item");

        li.appendChild(text);
        li.appendChild(icon);

        return li;
      })
      .withOnAfterBindItem((itemEl, item) => {
        const subscription = rxjs
          .fromEvent(itemEl, "click")
          .pipe(this.takeUntilLifeCycle())
          .subscribe(() => {
            if (this.READ_ONLY) {
              toastService.warning(
                "O modo apenas leitura está ativo para esta ação.",
                "Atenção!"
              );
              return;
            }

            this.handleOpenFile(item);
          });

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
  handleOpenFile(item) {
    const data = { fileId: item.FileID };

    this.localLoaderInstance.setIsLoading();

    storagePixelService
      .openFile(data)
      .pipe(this.takeUntilLifeCycle())
      .subscribe((data) => this.CB(data))
      .add(() => this.localLoaderInstance.unsetIsLoading());
  }

  /**
   * @param {SelectedStorage} storage
   */
  #handleSelectedStorage(storage) {
    const { storageName } = storage;
    this.selectedStorageTitle.innerText = storageName ?? "Nenhum";

    storagePixelService.setSelectedStorage(storage);
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
}

customElements.define("app-storage-selector", StorageSelector);
