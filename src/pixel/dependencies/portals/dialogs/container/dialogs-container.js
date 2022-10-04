import { WebComponent } from "../../../../libs/at/core/index.js";
import dialogsService from "../../../services/dialogs.service.js";
import template from "./dialogs-container.html";
import styles from "./dialogs-container.css";

class DialogsContainer extends WebComponent {
  constructor() {
    super(template, styles);
  }

  componentDidMount() {
    this.backdropEl = this.querySelector(".backdrop");
    this.contentEl = this.querySelector(".content");

    rxjs
      .fromEvent(this.backdropEl, "click")
      .pipe(this.takeUntilLifeCycle())
      .subscribe(dialogsService.close.bind(dialogsService));

    dialogsService
      .getObservable()
      .pipe(
        rxjs.operators.filter((state) => state.isOpen),
        rxjs.operators.map((state) => state.activeDialog),
        this.takeUntilLifeCycle()
      )
      .subscribe(this.handleOpenDialog.bind(this));

    dialogsService
      .getObservable()
      .pipe(
        rxjs.operators.filter((state) => !state.isOpen),
        this.takeUntilLifeCycle()
      )
      .subscribe(this.handleCloseDialog.bind(this));
  }

  handleOpenDialog(view) {
    this.classList.add("active");
    this.contentEl.innerHTML = "";

    this.contentEl.append(view);
  }

  handleCloseDialog() {
    this.contentEl.innerHTML = "";
    this.classList.remove("active");
  }
}

customElements.define("pixel-dialogs-container", DialogsContainer);
