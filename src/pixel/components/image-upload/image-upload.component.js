import { ComponentAdapter } from "../../dependencies/index.js";
import { ImageUpload } from "../../dependencies/domain/dtos/index.js";
import template from "./image-upload.component.html";
import styles from "./image-upload.component.css";

export default class ImageUploadComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.titleEl = this.querySelector("h3");
    this.descriptionEl = this.querySelector("p");
  }

  /**
   *@param  {ImageUpload} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      title,
      description,
    } = data;

    this.titleEl.textContent = title;
    this.descriptionEl.textContent = description;

    this.changeTextAlignment(textPosition, {
      title: this.titleEl,
      description: this.descriptionEl,
    });
  }
}

customElements.define(ImageUpload.typeName, ImageUploadComponent);
