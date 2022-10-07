import { IconUtils, UUIDUtils } from '../../dependencies/utils/index.js';
import { ListRenderControllerBuilder } from '../../libs/list-render/list-render-controller.js';
import { SimpleList } from '../../dependencies/domain/dtos/index.js';
import { ComponentAdapter, ComponentsFactory } from '../../dependencies/index.js';
import template from './simple-list.component.html';
import styles from './simple-list.component.css';
import * as Rxjs from 'rxjs';

export default class SimpleListComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.listSubject = new Rxjs.BehaviorSubject([]);
    this.itemPanelSubject = new Rxjs.BehaviorSubject(null);

    this.outerPanel = this.querySelector('[data-id="outer-panel"]');
    this.headerPanel = this.querySelector('[data-id="header-panel"]');
    this.titleEl = this.querySelector('h1');
    this.headerEl = this.querySelector('header');
    this.containerEl = this.querySelector('ul');
    this.buttonEl = this.querySelector('.add-item');
    this.componentSlotEl = this.querySelector('.component-slot');
  }

  componentDidMount() {
    this.listRenderController = new ListRenderControllerBuilder(this.containerEl)
      .withKeyExtractor(this.handleKeyExtractor.bind(this))
      .withContainerCreator(this.handleContainerCreator.bind(this))
      .withOnAfterBindContainerItem(this.handleOnAfterBindContainer.bind(this))
      .build();

    this.listSubject
      .pipe(
        Rxjs.switchMap((list) =>
          this.itemPanelSubject.pipe(Rxjs.map((panelProps) => list.map((item) => Object.assign({ panelProps }, item))))
        ),
        this.takeUntilLifeCycle()
      )
      .subscribe((list) => {
        this.listRenderController.render(list);
      });

    Rxjs.fromEvent(this.buttonEl, 'click').pipe(this.takeUntilLifeCycle()).subscribe(this.addItem.bind(this));
  }

  componentWillUnmount() {
    this.listRenderController.dispose();
  }

  /**
   * @param  {SimpleList} data
   */
  propsDidUpdate(data) {
    const {
      alignment,
      base: { options, headerComponent },
      headerPanel,
      itemPanel,
      outerPanel,
    } = data;

    this.outerPanel.propsDidUpdate(outerPanel);
    this.headerPanel.propsDidUpdate(headerPanel);
    this.configureHeaderComponent(headerComponent);
    this.itemPanelSubject.next(itemPanel);
    this.listSubject.next(options.map((opt) => ({ ...opt, alignment: alignment })));
  }

  configureHeaderComponent(data) {
    const { typeName, props } = data;

    const shouldRecreate = () => !this.headerComponentTypename || this.headerComponentTypename !== typeName;

    if (typeName) {
      if (shouldRecreate()) {
        this.headerComponentEl = ComponentsFactory.getComponentElement(typeName, props);
        this.headerComponentTypename = typeName;

        if (this.componentSlotEl.hasChildNodes()) {
          this.componentSlotEl.innerHTML = '';
        }

        this.componentSlotEl.appendChild(this.headerComponentEl);
      }

      this.headerComponentEl.setProps(props);
    }
  }

  handleKeyExtractor(item, index) {
    return item.key ?? item.id ?? index;
  }

  handleContainerCreator(_, item, key, i) {
    const containerEl = document.createElement('li');
    const panelContainerEl = document.createElement('widget-base-panel');
    const titleEl = document.createElement('input');
    const minusIcon = IconUtils.createIcon('minus', '20', 'var(--background-primary)');

    containerEl.panel = panelContainerEl;
    containerEl.titleEl = titleEl;
    containerEl.minusIcon = minusIcon;

    panelContainerEl.setAttribute('data-id', 'item-panel');
    panelContainerEl.classList.add('item-panel');
    panelContainerEl.appendChild(titleEl);
    panelContainerEl.appendChild(minusIcon);
    containerEl.appendChild(panelContainerEl);

    return containerEl;
  }

  handleOnAfterBindContainer(itemEl, _, item) {
    const { panel, minusIcon, titleEl } = itemEl;
    const { value, id, alignment, panelProps } = item;
    panel.propsDidUpdate(panelProps);
    this.ensureBorderOnItem(panelProps, panel);
    this.changeContentAlignment(alignment?.contentPosition, itemEl);
    titleEl.value = value;

    return [
      Rxjs.fromEvent(minusIcon, 'click').pipe(this.takeUntilLifeCycle()).subscribe(this.removeItem.bind(this, id)),
    ];
  }

  addItem() {
    this.listSubject.pipe(Rxjs.take(1), this.takeUntilLifeCycle()).subscribe((list) => {
      const newList = [
        ...list,
        {
          value: this.headerComponentEl.getInputValue(),
          id: UUIDUtils.getRandomId(),
        },
      ];

      this.listSubject.next(newList);
    });
  }

  removeItem(id) {
    this.listSubject
      .pipe(
        Rxjs.take(1),
        Rxjs.map((list) => list.filter((lt) => lt.id !== id)),
        this.takeUntilLifeCycle()
      )
      .subscribe((newList) => {
        const canRemove = () => !newList.length >= 1;

        if (canRemove()) return;

        this.listSubject.next(newList);
      });
  }

  ensureBorderOnItem(styles, itemElement) {
    const { border_width, border_color } = styles;

    itemElement.style.border = `${border_width}px solid ${border_color}`;
  }
}

customElements.define(SimpleList.typeName, SimpleListComponent);
