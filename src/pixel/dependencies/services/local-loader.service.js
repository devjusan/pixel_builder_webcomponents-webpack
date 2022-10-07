class LocalLoaderInstance {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.element = element;
    this.loaderizeElement(element);
  }

  setIsLoading() {
    this.backdropEl.classList.add("show-loader");
  }

  unsetIsLoading() {
    this.backdropEl.classList.remove("show-loader");
  }

  loaderizeElement(element) {
    this.backdropEl = document.createElement("div");
    const loaderEl = document.createElement("pixel-loading-bars");

    element.style.setProperty("position", "relative");
    this.backdropEl.classList.add("loader-instance-backdrop");

    this.backdropEl.append(loaderEl);
    element.append(this.backdropEl);
  }
}

class LocalLoaderService {
  constructor() {
    this.elementsMap = new Map();
  }

  getInstance(element) {
    if (!this.elementsMap.has(element)) {
      this.elementsMap.set(element, new LocalLoaderInstance(element));
    }

    return this.elementsMap.get(element);
  }

  unsetAll() {
    this.elementsMap.forEach((instance) => {
      instance.unsetIsLoading();
    });
  }
}

export default new LocalLoaderService();
