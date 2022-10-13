const app = {
  use(plugin, widgetInstance) {
    console.log("has been tryied to install plugin", plugin, widgetInstance);
  },
  async mount(rootElement) {
    const wrapper = document.querySelector(rootElement);
    const pixelBuilderContainer = document.createElement("div");
    pixelBuilderContainer.setAttribute("id", "pixel_builder_container");

    wrapper.appendChild(pixelBuilderContainer);

    await import("./index.js");
  },
  unmount(...args) {
    import("./pixel/dependencies/services/modals.service.js").then(
      (modalsService) => {
        modalsService.default.close();
      }
    );
  },
  config: {
    globalProperties: {},
  },
};

export default {
  constructor() {
    return app;
  },
  components: [{ name: "PixelBuilderValuation", component: app }],
};
