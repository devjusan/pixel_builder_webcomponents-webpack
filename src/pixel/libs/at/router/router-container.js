import { routerService } from './routerService.js';
import style from './router-container.css';
import { WebComponent } from '../core/index.js';

export class RouterContainer extends WebComponent {
  constructor() {
    super('', style);
  }

  renderRoute(route) {
    let container;
    if (route.layout) {
      if (this.layout !== route.layout) {
        this.layout = route.layout;
        this.layoutEl = $(route.layout);
        this.insertElementInto($(this), this.layoutEl);
      }

      container = this.layoutEl;
    } else {
      this.layout = '';
      this.layoutEl = null;
      container = $(this);
    }

    let element = $(route.component);
    this.insertElementInto(container, element);
  }

  insertElementInto(container, element) {
    let contentMark = container.__contentMark;
    if (!contentMark) {
      contentMark = container.find('component-content').first();
    }

    if (contentMark?.length) {
      let newContent = element;

      contentMark.replaceWith(newContent);
      container.__contentMark = newContent;
    } else {
      container.html('');
      container.append(element);
    }
  }

  componentDidMount() {
    routerService.events.pipe(this.takeUntilLifeCycle()).subscribe((route) => {
      this.renderRoute(route);
    });
  }
}

customElements.define('router-container', RouterContainer);

class RouterLink extends HTMLAnchorElement {
  connectedCallback() {
    this._clickSubscription = rxjs.fromEvent(this, 'click').subscribe((e) => {
      e.preventDefault();
      const href = this.href;
      routerService.navigate(href);
    });
  }

  disconnectedCallback() {
    this._clickSubscription?.unsubscribe();
  }
}

customElements.define('router-link', RouterLink, { extends: 'a' });
