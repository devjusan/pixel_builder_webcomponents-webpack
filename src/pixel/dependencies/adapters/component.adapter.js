import { WebComponent } from '../../libs/at/core/index.js';
import pixelService from '../services/pixel.service.js';

export default class ComponentAdapter extends WebComponent {
  sync(component) {
    this.setAttribute('id', component.id);
    this.setAttribute('data-id', component.id);
    this.setProps(component.props);
    this.setGridPos(component.gridPos);
    this.setClassNames(component.classNames);
  }

  getComponentId() {
    return this.getAttribute('data-id');
  }

  onInitCaller(...args) {
    if (this.ensureOriginality()) {
      this.onInit(...args);
      this.updatePropsIfCan(...args);
    }
  }

  componentDidMountCaller() {
    if (this.ensureOriginality()) {
      this.componentDidMount();
    }
  }

  componentWillUnmountCaller() {
    if (this.ensureOriginality()) {
      this.componentWillUnmount();
    }
  }

  setProps(data) {
    this.props = data;
    if (this.isConnected) this.updatePropsIfCan(data);
    else this.onInitCaller = this.onInitCaller.bind(this, data);
  }

  updatePropsIfCan(data) {
    if (this.propsDidUpdate) this.propsDidUpdate(data);
    else throw new Error(`${this.nodeName} must have propsDidUpdate method assigned.`);
  }

  setClassNames(classNames) {
    classNames.forEach((className) => this.classList.add(className));
  }

  setGridPos(gridPos) {
    const { rowStart, rowEnd, columnStart, columnEnd } = gridPos;

    this.style.gridArea = `${rowStart} / ${columnStart} / ${rowEnd} / ${columnEnd}`;
    this.setAttribute('data-grid-area', `${rowStart} / ${columnStart} / ${rowEnd} / ${columnEnd}`);
  }

  ensureOriginality() {
    return !this.classList.contains('ui-sortable-placeholder');
  }

  changeTextAlignment = (alignOption, widgetEl) => {
    const commandsMap = {
      'text-left': 'left',
      'text-center': 'center',
      'text-right': 'right',
    };

    widgetEl?.title?.style.setProperty('text-align', commandsMap[alignOption]);
    widgetEl?.description?.style.setProperty('text-align', commandsMap[alignOption]);
  };

  changeContentAlignment = (alignOption, contentEls) => {
    const commandsMap = {
      'content-left': 'left',
      'content-center': 'center',
      'content-right': 'right',
    };

    Array.from(Array.isArray(contentEls) ? contentEls : [contentEls]).forEach((el) => {
      el.style.textAlign = commandsMap[alignOption];
    });
  };

  actualPageComponentIndex() {
    const pages = pixelService.getPages();
    const components = pages.flatMap((page) => page.components);

    return components.findIndex((component) => component.id === this.getComponentId());
  }

  getInputValue() {
    return this.querySelector('input')?.value;
  }
}
