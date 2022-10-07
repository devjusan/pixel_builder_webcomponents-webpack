import { DialogConfig, SimpleDialogConfig } from '../../../adapters/dialogs.adapter.js';
import { DialogAdapter } from '../../../index.js';
import template from './dialogs-default.html';
import styles from './dialogs-default.css';
import * as Rxjs from 'rxjs';

export default class DefaultDialog extends DialogAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.titleEl = this.querySelector('.title');
    this.descriptionEl = this.querySelector('.description');
    this.primaryButtonEl = this.querySelector('button.primary');
    this.secondaryButtonEl = this.querySelector('button.secondary');
  }

  componentDidMount() {
    if (this.config instanceof DialogConfig) this.commonMount();
    else if (this.config instanceof SimpleDialogConfig) this.basicMount();
  }

  commonMount() {
    const { title, description, primaryAction, secondaryAction } = this.config;

    this.titleEl.textContent = title;
    this.descriptionEl.textContent = description;
    this.primaryButtonEl.textContent = primaryAction.title;
    this.secondaryButtonEl.textContent = secondaryAction.title;

    Rxjs.fromEvent(this.primaryButtonEl, 'click')
      .pipe(this.takeUntilLifeCycle())
      .subscribe(primaryAction.fn.bind(this, this.primaryButtonEl));

    Rxjs.fromEvent(this.secondaryButtonEl, 'click')
      .pipe(this.takeUntilLifeCycle())
      .subscribe(secondaryAction.fn.bind(this, this.secondaryButtonEl));
  }

  basicMount() {
    const { title, description, action } = this.config;

    this.titleEl.textContent = title;
    this.descriptionEl.textContent = description;

    this.primaryButtonEl.textContent = action.title;
    this.secondaryButtonEl.style.setProperty('display', 'none');

    Rxjs.fromEvent(this.primaryButtonEl, 'click')
      .pipe(this.takeUntilLifeCycle())
      .subscribe(action.handler.bind(this, this.primaryButtonEl));
  }
}

customElements.define('pixel-dialogs-default', DefaultDialog);
