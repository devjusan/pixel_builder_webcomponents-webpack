import {
  ComponentAdapter,
  Pixel,
  PixelComponent,
  PixelExecuteUtils,
  PixelPage,
  PixelPaginator,
  pixelService,
  PixelUtils,
  PixelWorkflow,
  PixelWorkflowFunction,
  PixelWorkflowMultipleOutcomesEntry,
  PixelWorkflowReport,
  PixelWorkflowReportEntry,
  PixelWorkflowSingleOutcomeEntry,
  PixelWorkflowStoreToken,
  UUIDUtils,
  actualPixelService,
  modalsService,
} from '../../dependencies/index.js';
import { PagesMultiplicatorTable } from '../../dependencies/domain/dtos/index.js';
import { ArrayUtils, ObjectUtils } from '../../dependencies/utils/index.js';
import dialogsService from '../../dependencies/services/dialogs.service.js';
import { DialogConfig } from '../../dependencies/adapters/dialogs.adapter.js';
import template from './pages-multiplicator-table.component.html';
import styles from './pages-multiplicator-table.component.css';
import * as Rxjs from 'rxjs';

export default class PagesMultiplicatorTableComponent extends ComponentAdapter {
  /** @type {Map<string, {token: PixelComponent, text: string}[]>} */
  #childrensMap;

  constructor() {
    super(template, styles);

    this.#childrensMap = new Map();
  }

  onInit() {
    this.titleEl = this.querySelector('h3');
    this.descriptionEl = this.querySelector('p');
    this.tableEl = this.querySelector('table');
    this.buttonEl = this.querySelector('.button');
    this.stageEl = document.querySelector('widget-stage');

    this.pixelExecuteInstance = new PixelExecuteUtils();
    this.taskCompleted = new Rxjs.Subject();
  }

  componentDidMount() {
    Rxjs.fromEvent(this.buttonEl, 'click')
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.replicateSequentiallyOnClick.bind(this));
  }

  /**
   *@param  {PagesMultiplicatorTable} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition, contentPosition },
      title,
      description,
      multiplicator,
      rows,
      columns,
      columnsLabelList,
      rowsLabelList,
    } = data;
    this.titleEl.textContent = title;
    this.descriptionEl.textContent = description;
    this.multiplicator = multiplicator;
    this.renderTable({ rows, rowsLabelList }, { columns, columnsLabelList }, multiplicator);
    this.changeTextAlignment(textPosition, { title: this.titleEl, description: this.descriptionEl });

    const tableEls = Array.from(this.querySelectorAll('table tr > *'));
    this.changeContentAlignment(contentPosition, tableEls);
    this.#initialInputValue();
  }

  replicateSequentiallyOnClick() {
    this.#preventHighValueMultiplicator();

    this.#handleDialog(() => this.replicate());
  }

  replicate() {
    this.#childrensMap.clear();
    return this.replicateInitialValue()
      .pipe(
        Rxjs.switchMap(() =>
          Rxjs.zip(
            Rxjs.from(this.replicateProps()),
            Rxjs.from(this.replicatePaginator()).pipe(Rxjs.observeOn(Rxjs.asapScheduler)),
            Rxjs.from(this.replicateWorkflowByPage()).pipe(Rxjs.observeOn(Rxjs.asyncScheduler))
          )
        )
      )
      .pipe(this.takeUntilLifeCycle())
      .subscribe((pixel) => {
        this.stageEl.closeModal?.();
        const [props, paginator, workflow] = pixel;
        const pixelJson = JSON.stringify({
          version: Pixel.version,
          props,
          paginator,
          workflow,
        });
        modalsService.open('widget-stage', { pixelJson });
        this.taskCompleted.next();
      });
  }

  replicateInitialValue() {
    return actualPixelService.getActual().pipe(
      Rxjs.tap((payload) => {
        pixelService.getPixel().fromJSON(payload?.pixelJson ?? JSON.stringify(pixelService.getPixel().toJSON()));
      })
    );
  }

  replicateProps() {
    return new Promise((resolve) => {
      const props = pixelService.getProps();

      resolve(props);
    });
  }

  replicatePaginator() {
    return new Promise((resolve) => {
      const pages = pixelService.getPages();
      const newPages = [];
      const actualPageComponentIndex = this.actualPageComponentIndex();
      const actualMultiplicator = pixelService.getMultiplicator();
      const filtredComponentPageIndex = actualPageComponentIndex === 0 ? 1 : actualPageComponentIndex;
      this.clonedPagesLength = pages.length - filtredComponentPageIndex;

      if (actualPageComponentIndex === -1) {
        return;
      }

      for (let i = 0; i < actualMultiplicator; i++) {
        const cuttedPages = this.#generateOnInitCuttedPages(actualPageComponentIndex + 1) ?? [];
        newPages.push(...cuttedPages);
      }

      const replicatedPages = [...pages, ...newPages.slice(pages.length - 1)];

      const paginator = new PixelPaginator(actualPageComponentIndex, replicatedPages);

      pixelService.setPagination(paginator);
      resolve(paginator);
    });
  }

  replicateWorkflowByPage() {
    return new Promise((resolve) => {
      const pages = pixelService.getPages();
      const actualPageComponentIndex = this.actualPageComponentIndex();
      const slicedPages = [...pages].slice(actualPageComponentIndex + 1);
      const chunkedPages = this.#chunk(slicedPages, this.clonedPagesLength);
      const beforeComponents = pages.slice(0, actualPageComponentIndex + 1).flatMap((page) => page.getAllComponents());

      let fnsList = [];
      let singleOutcomeEntriesList = [];
      let multipleOutcomeEntriesList = [];
      let reportList = [];
      for (let index = 0; index < chunkedPages.length; index++) {
        const chunked = chunkedPages[index];
        const afterComponents = chunked.flatMap((page) => page.getAllComponents());

        const fns = this.replicateFunctions(afterComponents, beforeComponents);
        const singleEntries = this.replicateSingleOutcomeEntries(afterComponents, beforeComponents, fns);
        const multipleOutcomeEntries = this.replicateMultipleOutcomesEntries(afterComponents, beforeComponents);
        const reports = this.replicateReports(afterComponents, beforeComponents);

        fnsList.push(...fns);
        singleOutcomeEntriesList.push(...singleEntries);
        multipleOutcomeEntriesList.push(...multipleOutcomeEntries);
        reportList = reports;
      }

      const { trigger, saveTrigger, loadTrigger } = pixelService.getWorkflow();

      const workflow = new PixelWorkflow(
        trigger,
        saveTrigger,
        loadTrigger,
        fnsList,
        singleOutcomeEntriesList,
        multipleOutcomeEntriesList,
        reportList
      );

      resolve(workflow);
    });
  }

  /**
   * @param {PixelComponent[]} components
   * @param {PixelComponent[]} beforeComponents
   */
  replicateFunctions(components, beforeComponents) {
    const functions = pixelService.getWorkflow().functions;

    if (functions.length === 0) {
      return [];
    }

    let fns = [];
    for (let index = 0; index < functions.length; index++) {
      const fn = functions[index];

      const fnEntries = Object.values(fn.fieldEntriesMap);
      let fields = components.filter((component) => this.#findComponent(fnEntries, component));

      if (!fields.length) {
        fields = beforeComponents.filter((component) => this.#findComponent(fnEntries, component));
      }

      if (fields.length !== fnEntries.length) {
        fields = [
          ...components.filter((component) => this.#findComponent(fnEntries, component)),
          ...beforeComponents.filter((component) => this.#findComponent(fnEntries, component)),
        ];
      }

      fns.push(
        new PixelWorkflowFunction(UUIDUtils.getRandomId(), {
          status: fn.status,
          collectionId: fn.collectionId,
          externalId: fn.externalId,
          requestMethod: fn.requestMethod,
          url: fn.url,
          fieldEntriesMap: Object.assign({}, fields),
        })
      );
    }

    const filtredFns = fns.filter((fn) => fn.fieldEntriesMap[0]?.props);

    return filtredFns;
  }

  /**
   * @param {PixelComponent[]} components
   * @param {PixelComponent[]} beforeComponents
   * @param {PixelWorkflowFunction[]} fnActualPageList
   */
  replicateSingleOutcomeEntries(components, beforeComponents, fnActualPageList) {
    const singleOutcomeEntries = pixelService.getWorkflow().singleOutcomeEntries;

    if (singleOutcomeEntries.length === 0) {
      return [];
    }

    let entries = [];
    for (let index = 0; index < singleOutcomeEntries.length; index++) {
      const entry = singleOutcomeEntries[index];
      let component = this.#findComponent(components, entry.component);

      const fn = fnActualPageList.find((fnA) => fnA.url === entry.storeToken.fn?.url);

      if (!component) {
        component = this.#findComponent(beforeComponents, entry.component);
      }

      if (!component || !fn) {
        continue;
      }

      const storeToken = { ...entry.storeToken, fn };

      entries.push(
        new PixelWorkflowSingleOutcomeEntry(
          component,
          new PixelWorkflowStoreToken(storeToken?.fn, storeToken?.field),
          UUIDUtils.getRandomId()
        )
      );
    }
    return entries;
  }

  replicateMultipleOutcomesEntries(components, beforeComponents) {
    const multipleOutcomesEntries = pixelService.getWorkflow().multipleOutcomesEntries;

    if (multipleOutcomesEntries.length === 0) {
      return [];
    }

    let entries = [];
    for (let index = 0; index < multipleOutcomesEntries.length; index++) {
      const entry = multipleOutcomesEntries[index];

      let component = multipleOutcomesEntries.find(() => this.#findComponent(components, entry.component))?.component;

      if (!component) {
        component = multipleOutcomesEntries.find(() =>
          this.#findComponent(beforeComponents, entry.component)
        )?.component;
      }

      if (!component) {
        continue;
      }

      entries.push(new PixelWorkflowMultipleOutcomesEntry(component, UUIDUtils.getRandomId()));
    }

    return entries;
  }

  /**
   * @param {PixelComponent[]} components
   * @param {PixelComponent[]} beforeComponents
   */
  replicateReports(components, beforeComponents) {
    const reports = pixelService.getWorkflow().reports;

    if (reports.length === 0) {
      return [];
    }

    let reportsList = [];
    for (let j = 0; j < reports.length; j++) {
      const report = reports[j];
      let trigger = this.#findComponent(components, report.trigger);

      if (!trigger) {
        trigger = this.#findComponent(beforeComponents, report.trigger);
      }

      let entries = [];
      let childrens = [];
      for (let k = 0; k < report.entries.length; k++) {
        const entry = report.entries[k];
        let token = this.#findComponent(components, entry.token);

        if (!token) {
          token = this.#findComponent(beforeComponents, entry.token);
        }

        if (entry.childrens.length) {
          const replicatedChildrens = this.#replicateChildrens(entry.childrens, components, beforeComponents);
          childrens = this.#childrensMap.get(entry.id) ?? [];

          this.#childrensMap.set(entry.id, [...childrens, ...replicatedChildrens]);
        }

        const entryChildrens = this.#childrensMap.get(entry.id);

        if (!entryChildrens) {
          entries[k] = new PixelWorkflowReportEntry(token, entry.title, entry.id, []);
          continue;
        }

        entries[k] = new PixelWorkflowReportEntry(
          token,
          entry.title,
          entry.id,
          ArrayUtils.uniqBy(entryChildrens, (entry) => entry.token.id)
        );
      }

      const filteredEntries = entries.filter((entry) => entry.childrens.length || entry?.token);

      reportsList[j] = new PixelWorkflowReport(report.id, report.externalId, report.title, trigger, filteredEntries);
    }

    return reportsList;
  }

  /**
   * @param {{token: PixelComponent, text: string}[]} childrens
   * @param {PixelComponent[]} components
   * @param {PixelComponent[]} beforeComponents
   */
  #replicateChildrens(childrens, components, beforeComponents) {
    let childrensList = [];
    for (let index = 0; index < childrens.length; index++) {
      const { token, text } = childrens[index];
      let component = this.#findComponent(components, token);

      if (!component) {
        component = this.#findComponent(beforeComponents, token);
      }

      if (!component) {
        component = token;
      }

      childrensList.push({ token: component, text });
    }
    return childrensList;
  }

  #generateOnInitCuttedPages(startIndex) {
    const pages = pixelService.getPages();

    const generatedPages = [...pages].slice(startIndex).map((page) => {
      const components = this.#copyComponents(page.components);

      return new PixelPage(components, UUIDUtils.getRandomId());
    });

    return generatedPages;
  }

  renderTable(rowsData, columnsData, multiplicator) {
    const { rows, rowsLabelList } = rowsData;
    const { columns, columnsLabelList } = columnsData;

    this.generateTableHead(this.tableEl, columns, columnsLabelList);
    this.generateTableBody(this.tableEl, rows, columns, rowsLabelList, multiplicator);
  }

  generateTableHead(table, columns, columnsLabelList) {
    table.deleteTHead();

    const thead = table.createTHead();
    const row = thead.insertRow();

    for (let i = 1; i <= columns; i++) {
      const th = document.createElement('th');
      const columnValue = columnsLabelList?.find((column) => column.position === i)?.label ?? `Coluna ${i}`;
      const text = document.createTextNode(columnValue);

      th.appendChild(text);
      row.appendChild(th);
    }
  }

  generateTableBody(table, rows, columns, rowsLabelList) {
    let isInputCreated = false;
    for (let i = 1; i <= rows; i++) {
      const row = table.insertRow();
      const title = document.createElement('th');
      const rowValue = rowsLabelList?.find((row) => row.position === i)?.label ?? `Linha ${i}`;
      const titleText = document.createTextNode(rowValue);

      title.appendChild(titleText);

      for (let j = 1; j <= columns; j++) {
        const cell = row.insertCell();
        const cellInput = document.createElement('input');

        cellInput.value = 'Digite algo...';

        if (j === 1) {
          cellInput.value = i;
          cellInput.setAttribute('disabled', 'true');
        }

        if (j === 2 && isInputCreated) {
          cellInput.value = '-';
          cellInput.setAttribute('disabled', 'true');
        }

        if (j === 2 && !isInputCreated) {
          cellInput.setAttribute('type', 'number');
          cellInput.setAttribute('min', '2');
          cellInput.setAttribute('max', String(this.multiplicator));
          cellInput.setAttribute('step', '1');
          cellInput.setAttribute('id', 'multiplicator');

          isInputCreated = true;
        }

        cell.appendChild(cellInput);
      }
    }
  }

  /**
   * @param {PixelComponent[]} components
   * @param {PixelComponent} ct
   * @returns {PixelComponent}
   */
  #findComponent(components, ct) {
    return components?.find((component) => this.#compareComponents(component, ct));
  }

  #copyComponents(components) {
    return this.#copyComponentsRecursively(components);
  }

  /**
   * @param {PixelComponent[]} components
   * @returns {PixelComponent[]}
   */
  #copyComponentsRecursively(components) {
    return components.map((component) => {
      const props = component.props.components
        ? {
            ...component.props,
            components: this.#copyComponentsRecursively(component.props.components),
          }
        : { ...component.props };

      const newComponent = new PixelComponent(component.typeName, component.gridPos, props, UUIDUtils.getRandomId());

      return newComponent;
    });
  }

  /**
   * @param {PixelComponent} component
   * @param {PixelComponent} entryComponent
   */
  #compareComponents(component, entryComponent) {
    if (!component || !entryComponent) {
      return false;
    }

    return (
      PixelUtils.isGridPosEqual(component.gridPos, entryComponent.gridPos) &&
      component.typeName === entryComponent.typeName &&
      ObjectUtils.equals(component.props, entryComponent.props)
    );
  }

  #preventHighValueMultiplicator() {
    const multiplicatorActualValue = Number(this.querySelector('#multiplicator').value);

    if (multiplicatorActualValue > this.multiplicator) {
      const multiplicatorEl = this.querySelector('#multiplicator');
      multiplicatorEl.value = this.multiplicator;

      pixelService.setMultiplicator(this.multiplicator);
      return;
    }
    pixelService.setMultiplicator(multiplicatorActualValue);
  }

  #chunk(array, size) {
    const chunkedArray = [];
    let index = 0;

    while (index < array.length) {
      chunkedArray.push(array.slice(index, index + size));
      index += size;
    }

    return chunkedArray;
  }

  #initialInputValue() {
    const multiplicatorEl = this.querySelector('#multiplicator');
    multiplicatorEl.value = 2;
  }

  #handleDialog(onConfirm, onDeny) {
    dialogsService.open(
      new DialogConfig(
        'dialogs-default',
        DialogConfig.Confirmations.Changes_Would_Be_Lost,
        {
          title: 'Continuar',
          fn: () => {
            dialogsService.close();
            onConfirm?.();
          },
        },
        {
          title: 'Cancelar',
          fn: () => {
            dialogsService.close();
            onDeny?.();
          },
        }
      )
    );
  }
}

customElements.define(PagesMultiplicatorTable.typeName, PagesMultiplicatorTableComponent);
