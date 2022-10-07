import { WebComponent } from '../../../libs/at/core/index.js';
import template from './loading-bars.html';
import styles from './loading-bars.css';

export class LoadingBars extends WebComponent {
  constructor() {
    super(template, styles);
  }
}

customElements.define('pixel-loading-bars', LoadingBars);
