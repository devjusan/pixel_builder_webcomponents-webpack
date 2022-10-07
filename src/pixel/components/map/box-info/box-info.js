import { ListRenderControllerBuilder } from '../../../libs/list-render/index.js';
import { WebComponent } from '../../../libs/at/core/index.js';
import template from './box-info.html';
import styles from './box-info.css';
import * as Rxjs from 'rxjs';

export default class BoxInfo extends WebComponent {
  #listSubject;

  constructor() {
    super(template, styles);

    this.#listSubject = new Rxjs.BehaviorSubject([]);
  }

  onInit() {
    this.containerEl = this.querySelector('.box-info-container');
    this.minimizeEl = this.querySelector('.box-info-handler');

    this.classList.toggle('box-info-minimize');
  }

  componentDidMount() {
    this.listRenderController = new ListRenderControllerBuilder(this.containerEl)
      .withKeyExtractor((item, index) => item.key ?? item.gid ?? index)
      .withItemCreator((item) => {
        const itemEl = document.createElement('li');
        const titleEl = document.createElement('h4');
        const backgroundEl = document.createElement('span');

        itemEl.appendChild(backgroundEl);
        itemEl.appendChild(titleEl);

        itemEl.titleEl = titleEl;
        itemEl.backgroundEl = backgroundEl;

        return itemEl;
      })
      .withOnAfterBindItem((itemEl, item) => {
        const { titleEl, backgroundEl } = itemEl;

        titleEl.innerText = item.title ?? item.oldName;
        this.#handleIcon(backgroundEl, item);
      })
      .build();

    this.#listSubject.pipe(this.takeUntilLifeCycle()).subscribe((legends) => {
      this.listRenderController.render(legends);
    });
  }

  addLegendOrUpdate(legend) {
    this.#listSubject.pipe(Rxjs.take(1), this.takeUntilLifeCycle()).subscribe((legends) => {
      const legendIndex = legends.findIndex((l) => l.key === legend.key);
      const newLegends = [...legends];

      if (legendIndex === -1) {
        newLegends.push(legend);
      } else {
        newLegends[legendIndex] = legend;
      }

      this.#listSubject.next(newLegends);
    });
  }

  removeLegend(item) {
    this.#listSubject.pipe(Rxjs.take(1), this.takeUntilLifeCycle()).subscribe((legends) => {
      const newLegends = legends.filter((legend) => legend.key !== item.key);

      this.#listSubject.next(newLegends);
    });
  }

  /**
   * @param {HTMLElement } backgroundEl
   * @param {size: number, color: string, fill: string, lineDash: boolean }
   * */
  #handleIcon(backgroundEl, item) {
    backgroundEl.style.borderColor = item.color;
    backgroundEl.style.backgroundColor = this.#convertHexToRGBA(item.fill, item.opacity);
    backgroundEl.style.borderStyle = item.lineDash ? 'dashed' : 'solid';
  }

  #convertHexToRGBA(hex, opacity) {
    if (!hex || !opacity) {
      return 'none';
    }

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}

customElements.define('app-box-info', BoxInfo);
