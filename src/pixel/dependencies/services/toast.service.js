class ToastService {
  /** @type {number} */
  #counter;

  constructor() {
    this.toast = toastr;
    this.defaultOptions = {
      closeButton: false,
      debug: false,
      newestOnTop: false,
      progressBar: true,
      positionClass: 'toast-bottom-left',
      preventDuplicates: true,
      onclick: null,
      onShown: this.#onShow.bind(this),
      onHidden: this.#onHidden.bind(this),
      showDuration: '300',
      hideDuration: '1000',
      timeOut: '5000',
      extendedTimeOut: '1000',
      showEasing: 'swing',
      hideEasing: 'linear',
      showMethod: 'fadeIn',
      hideMethod: 'fadeOut',
    };
    this.toast.options = this.defaultOptions;
    this.#counter = 0;
  }

  success(message, title, options) {
    if (this.hasToastActive()) return;

    this.#notify('success', message, title, options);
  }

  error(message, title, options) {
    if (this.hasToastActive()) return;

    this.#notify('error', message, title, options);
  }

  warning(message, title, options) {
    if (this.hasToastActive()) return;

    this.#notify('warning', message, title, options);
  }

  info(message, title, options) {
    if (this.hasToastActive()) return;

    this.#notify('info', message, title, options);
  }

  hasToastActive() {
    return this.numberOfToasts() > 2;
  }

  numberOfToasts() {
    return this.#counter;
  }

  #notify(type, message, title, options) {
    const mergedOptions = Object.assign({}, this.defaultOptions, options);

    this.toast[type](message, title, mergedOptions);
  }

  #onShow() {
    this.#counter += 1;
  }

  #onHidden() {
    this.#counter -= 1;
  }
}

export default new ToastService();
