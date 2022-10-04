import ComponentAdapter from './component.adapter.js';
import eventBusService from '../services/event-bus.service.js';

export default class GroupComponentAdapter extends ComponentAdapter {
  connectedCallback() {
    super.connectedCallback();
    if (window.IS_PIXEL_BUILDER_ENV && this.ensureOriginality()) {
      this.handleSortableInitialSetup();
      eventBusService.emit('WIDGET-GROUP-ELEMENT:MOUNTED', this);
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if (window.IS_PIXEL_BUILDER_ENV && this.ensureOriginality()) {
      eventBusService.emit('WIDGET-GROUP-ELEMENT:WILL-UNMOUNT', this);
    }
  }

  setGridPos(gridPos) {
    super.setGridPos(gridPos);
    if (window.IS_PIXEL_BUILDER_ENV && this.isConnected) {
      eventBusService.emit('WIDGET-GROUP-ELEMENT:DID-UPDATE', this);
    }
  }

  addComponent(element) {
    if (window.IS_PIXEL_BUILDER_ENV && this.isConnected) {
      this.sortableContainerEl.appendChild(element);
    }
  }

  handleSortableInitialSetup() {
    this.sortableContainerEl = this.querySelector('.sortable-container');
    const componentId = this.getAttribute('id');

    if (!this.sortableContainerEl) {
      console.warn(`${this.nodeName} must have .sortable-container dom element`);
      console.trace();
      return;
    }

    this.sortableContainerEl.setAttribute('id', `group-${componentId}-sortable-container`);
  }
}
