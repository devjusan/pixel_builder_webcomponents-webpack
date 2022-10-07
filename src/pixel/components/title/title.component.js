import { ComponentAdapter } from '../../dependencies/index.js';
import { Title } from '../../dependencies/domain/dtos/index.js';
import template from './title.component.html';
import styles from './title.component.css';

export default class TitleComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.titleEl = this.querySelector('h1');

    this.titleEl.setAttribute('id', this.getComponentId());
  }

  /**
   *@param  {Title} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
      size,
    } = data;

    this.titleEl.textContent = description;

    this.changeTextAlignment(textPosition, { description: this.titleEl });
    this.#handleTitleSize(size);
  }

  /**
   * @param  {'small' | 'medium' | 'large'} size
   */
  #handleTitleSize(size) {
    switch (size) {
      case 'small':
        this.titleEl.style.fontSize = '18px';
        break;
      case 'medium':
        this.titleEl.style.fontSize = '25px';
        break;
      case 'large':
        this.titleEl.style.fontSize = '40px';
        break;
    }
  }
}

customElements.define(Title.typeName, TitleComponent);
