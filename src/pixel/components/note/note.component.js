import { ComponentAdapter } from "../../dependencies/index.js";
import { Note } from "../../dependencies/domain/dtos/index.js";
import template from "./note.component.html";
import styles from "./note.component.css";

export default class NoteComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.titleEl = this.querySelector("h3");
    this.noteTextEl = this.querySelector("p");
  }

  /**
   *@param  {{
   *  alignment: { textPosition: string; contentPosition: string };
   *  title: string;
   *  noteText: string;
   *}} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition, contentPosition },
      title,
      noteText,
    } = data;

    this.titleEl.textContent = title;
    this.noteTextEl.textContent = noteText;

    this.changeTextAlignment(textPosition, { title: this.titleEl });
    this.changeContentAlignment(contentPosition, this.noteTextEl);
  }
}

customElements.define(Note.typeName, NoteComponent);
