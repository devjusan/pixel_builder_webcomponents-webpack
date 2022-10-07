import { Pixel, PixelProps, PixelPaginator, PixelPage, PixelWorkflow } from '../domain/models/pixel/index.js';
import { actualPixelService, modalsService } from '../index.js';
import * as Rxjs from 'rxjs';

class PixelService {
  /** @type{Pixel} */
  #pixel;

  /** @type  {number} */
  #actualMultiplicator;

  #mountType;

  constructor() {
    this.#pixel = new Pixel(new PixelProps(), new PixelPaginator(0, [new PixelPage()]), new PixelWorkflow());
    this.propsSubject = new Rxjs.Subject();
    this.pagesSubject = new Rxjs.Subject();
    this.paginationSubject = new Rxjs.Subject();

    this.onTotalPagesChangesSubject = new Rxjs.Subject();
    this.onActivePageChangesSubject = new Rxjs.Subject();

    this.onLoadComponentsSubject = new Rxjs.Subject();
    this.onAddComponentSubject = new Rxjs.Subject();
    this.onMoveThroughGroupsComponentSubject = new Rxjs.Subject();
    this.onUpdateComponentPropsSubject = new Rxjs.Subject();
    this.onUpdateComponentGridPosSubject = new Rxjs.Subject();
    this.onDeleteComponentSubject = new Rxjs.Subject();
    this.onCompleteLoadSubject = new Rxjs.Subject();

    this.#actualMultiplicator = 1;
    this.#mountType = {
      modal: this.#mountWithModal,
      noModal: this.#mountWithNoModal,
    };
  }

  /**
   * @param {Pixel} pixelJson
   * @param {'modal' | 'noModal'=} mountType
   * @param {boolean=} defineInitial
   */
  importPixelProject(pixelJson, mountType, defineInitial) {
    try {
      this.#mountType[mountType]?.(pixelJson);
      defineInitial && actualPixelService.setActual({ pixelJson });

      const { paginator, props, workflow } = this.#pixel.fromJSON(pixelJson);
      this.setProps(props);
      this.setPagination(paginator);
      this.setPages(paginator.pages);
      this.setTotalPages(paginator.pages.length);
      this.setWorkflow(workflow);
      this.loadComponents();

      console.log('Pixel project imported');
    } catch (error) {
      console.error(error);
    }
  }

  loadComponents() {
    this.onLoadComponentsSubject.next();
  }

  addComponent(pageIndexOrGroupId, component) {
    this.onAddComponentSubject.next({ pageIndexOrGroupId, component });
  }

  moveComponentThroughGroups(pageIndexOrGroupId, component) {
    this.onMoveThroughGroupsComponentSubject.next({
      pageIndexOrGroupId,
      component,
    });
  }

  updateComponentProps(component) {
    this.onUpdateComponentPropsSubject.next(component);
  }

  updateComponentGridPos(component) {
    this.onUpdateComponentGridPosSubject.next(component);
  }

  deleteComponent(id) {
    this.onDeleteComponentSubject.next(id);
  }

  setPixel(pixel) {
    this.#pixel = pixel;
  }

  setWorkflow(workflow) {
    this.#pixel.setWorkflow(workflow);
  }

  setFunctions(functions) {
    this.#pixel.workflow.functions = functions;
  }

  setMultipleOutcomesEntries(multipleOutcomesEntries) {
    this.#pixel.workflow.multipleOutcomesEntries = multipleOutcomesEntries;
  }

  setReports(reports) {
    this.#pixel.workflow.reports = reports;
  }

  setSingleOutcomeEntries(singleOutcomeEntries) {
    this.#pixel.workflow.singleOutcomeEntries = singleOutcomeEntries;
  }

  setProps(props) {
    this.#pixel.setProps(props);
    this.propsNext();
  }

  setPagination(pagination) {
    this.#pixel.setPaginator(pagination);

    this.paginatorNext();
  }

  setPages(pages) {
    this.#pixel.paginator.pages = pages;

    this.paginatorNext();
    this.pagesNext();
  }

  setTotalPages(total) {
    this.onTotalPagesChangesSubject.next(total);
  }

  setActivePage(page) {
    this.onActivePageChangesSubject.next(page);
  }

  setMultiplicator(multiplicator) {
    this.#actualMultiplicator = multiplicator;
  }

  getMultiplicator() {
    return this.#actualMultiplicator;
  }

  paginateNext() {
    this.#pixel.paginator.paginateNext();

    this.activePageNext();
    this.paginatorNext();
  }

  completeLoadNext() {
    this.onCompleteLoadSubject.next();
  }

  paginatePrevious() {
    this.#pixel.paginator.paginatePrevious();

    this.activePageNext();
    this.paginatorNext();
  }

  getCompleteLoadObservable() {
    if (!this.completeLoadObservable) {
      this.completeLoadObservable = this.onCompleteLoadSubject.asObservable();
    }

    return this.completeLoadObservable;
  }

  getPropsObservable() {
    if (!this.propsObservable) {
      this.propsObservable = this.propsSubject.asObservable();
    }

    return this.propsObservable;
  }

  getPagesObservable() {
    if (!this.pagesObservable) {
      this.pagesObservable = this.pagesSubject.asObservable();
    }

    return this.pagesObservable;
  }

  getActivePageObservable() {
    if (!this.activePageObservable) {
      this.activePageObservable = this.onActivePageChangesSubject.asObservable();
    }

    return this.activePageObservable;
  }

  getTotalPagesObservable() {
    if (!this.totalPagesObservable) {
      this.totalPagesObservable = this.onTotalPagesChangesSubject.asObservable();
    }

    return this.totalPagesObservable;
  }

  getPaginationObservable() {
    if (!this.paginationObservable) {
      this.paginationObservable = this.paginationSubject.asObservable();
    }

    return this.paginationObservable;
  }

  getLoadComponentsObservable() {
    if (!this.loadComponentsObservable) {
      this.loadComponentsObservable = this.onLoadComponentsSubject.pipe(Rxjs.map(() => this.#pixel));
    }

    return this.loadComponentsObservable;
  }

  getAddComponentObservable() {
    if (!this.addComponentObservable) {
      this.addComponentObservable = this.onAddComponentSubject.asObservable();
    }

    return this.addComponentObservable;
  }

  getMoveThroughGroupsComponentObservable() {
    if (!this.moveComponentThroughGroupsObservable) {
      this.moveComponentThroughGroupsObservable = this.onMoveThroughGroupsComponentSubject.asObservable();
    }

    return this.moveComponentThroughGroupsObservable;
  }

  getUpdateComponentPropsObservable() {
    if (!this.updateComponentPropsObservable) {
      this.updateComponentPropsObservable = this.onUpdateComponentPropsSubject.asObservable();
    }

    return this.updateComponentPropsObservable;
  }

  getUpdateComponentGridPosObservable() {
    if (!this.updateComponentGridPosObservable) {
      this.updateComponentGridPosObservable = this.onUpdateComponentGridPosSubject.asObservable();
    }

    return this.updateComponentGridPosObservable;
  }

  getRemoveComponentObservable() {
    if (!this.deleteComponentObservable) {
      this.deleteComponentObservable = this.onDeleteComponentSubject.asObservable();
    }

    return this.deleteComponentObservable;
  }

  getPixel() {
    return this.#pixel;
  }

  getWorkflow() {
    return this.#pixel.workflow;
  }

  getPages() {
    return this.#pixel.paginator.pages;
  }

  getPaginator() {
    return this.#pixel.paginator;
  }

  getProps() {
    return this.#pixel.props;
  }

  propsNext() {
    this.propsSubject.next(this.#pixel.props);
  }

  paginatorNext() {
    this.paginationSubject.next(this.#pixel.paginator);
  }

  pagesNext() {
    this.pagesSubject.next(this.#pixel.paginator.pages);
  }

  activePageNext() {
    this.onActivePageChangesSubject.next(this.#pixel.paginator.getPage(this.#pixel.paginator.active));
  }

  #mountWithModal() {
    const modalContainer = document.createElement('pixel-modals-container');
    document.body.appendChild(modalContainer);

    modalsService.open('widget-stage');
  }

  #mountWithNoModal(source) {
    const pixelEl = document.getElementById('pixelbuilder_valuation');
    pixelEl.noModal = true;
    pixelEl.pixel = source;
    pixelEl.classList.add('no-modal');
  }
}

export default new PixelService();
