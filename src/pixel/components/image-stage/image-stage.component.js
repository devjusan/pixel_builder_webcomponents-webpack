import { ComponentAdapter } from "../../dependencies/index.js";
import { ImageStage } from "../../dependencies/domain/dtos/index.js";
import template from "./image-stage.component.html";
import styles from "./image-stage.component.css";

export default class ImageStageComponent extends ComponentAdapter {
  constructor() {
    super(template, styles);
  }

  onInit() {
    this.descriptionEl = this.querySelector("p");
    this.imgEl = this.querySelector("img");
  }

  /**
   *@param  {ImageStage} data
   */
  propsDidUpdate(data) {
    const {
      alignment: { textPosition },
      description,
      image_src,
      range_input,
    } = data;

    this.descriptionEl.textContent = description;

    if (this.isImgUploaded(image_src)) {
      this.renderImg(image_src, this.convertRangeToOpacity(range_input));
    }

    this.changeTextAlignment(textPosition, { description: this.descriptionEl });
  }

  // The image_src can receive "#" or "http:localhost/#" as value
  isImgUploaded(imageSrc) {
    const lastIndex = "-1";
    const isUploaded = Boolean(imageSrc && !imageSrc.includes("#", lastIndex));

    return isUploaded;
  }

  convertRangeToOpacity(range) {
    const opacity = range / 100;
    return opacity;
  }

  renderImg(src, opacity) {
    this.imgEl.src = src;
    this.imgEl.style.setProperty("display", "block");
    this.imgEl.style.setProperty("opacity", opacity);
  }
}

customElements.define(ImageStage.typeName, ImageStageComponent);
