import { WebComponent } from '../../../../libs/at/core/index.js';
import { modalsService } from '../../../index.js';
import template from './modals-container.html';
import styles from './modals-container.css';
import * as Rxjs from 'rxjs';

export default class ModalsContainer extends WebComponent {
  constructor() {
    super(template, styles);
  }

  componentDidMount() {
    this.backdropEl = this.querySelector('.backdrop');
    this.contentEl = this.querySelector('.content');

    modalsService.getPushModalObservable().pipe(this.takeUntilLifeCycle()).subscribe(this.handlePushModal.bind(this));

    modalsService.getPopModalObservable().pipe(this.takeUntilLifeCycle()).subscribe(this.handlePopModal.bind(this));
  }

  handlePushModal(modalSettings) {
    const { view, payload, isActionRequired } = modalSettings;

    view.classList.add('modal-view');
    view.isActionRequired = isActionRequired;
    view.setPayload(payload);
    view.subscribeCloseModalFn(this.handleCloseModal.bind(this));
    this.contentEl.appendChild(view);

    this.ensureBackdrop();
    this.ensureCloseModalViaBackdrop();
  }

  handlePopModal(modalSettings) {
    try {
      this.contentEl.removeChild(modalSettings.view);
      this.ensureBackdrop();
      this.ensureCloseModalViaBackdrop();
    } catch (error) {
      console.error(error);
    }
  }

  ensureBackdrop() {
    if (this.contentEl.children.length) this.classList.add('active');
    else this.classList.remove('active');
  }

  ensureCloseModalViaBackdrop() {
    this.closeModalViaBackdropSubscription?.unsubscribe();
    if (this.contentEl.lastChild && !this.contentEl.lastChild.isActionRequired) {
      this.closeModalViaBackdropSubscription = this.enableCloseModalViaBackdrop();
    }
  }

  enableCloseModalViaBackdrop() {
    return Rxjs.fromEvent(this.backdropEl, 'click')
      .pipe(this.takeUntilLifeCycle())
      .subscribe(this.handleCloseModal.bind(this));
  }

  handleCloseModal() {
    modalsService.close();
  }
}

customElements.define('pixel-modals-container', ModalsContainer);
