const app = {
  use(plugin, widgetInstance) {
    console.log("has been tryied to install plugin", plugin, widgetInstance);
  },
  mount(rootElement) {
    const wrapper = document.querySelector(rootElement);
    const pixelBuilderContainer = document.createElement("div");
    pixelBuilderContainer.setAttribute("id", "pixel_builder_container");

    wrapper.appendChild(pixelBuilderContainer);

    import("./pixel/insertCdn.js").then(async () => {
      await import("./index.js");
      await import("./pixel/modules.js").then(async () => {
        const container = document.getElementById("pixel_builder_container");
        const stageEl = document.createElement("widget-stage");
        stageEl.id = "pixelbuilder_valuation";
        container.appendChild(stageEl);

        await import("./pixel/scopedStyles.js");
      });
    });
  },
  unmount(...args) {
    console.log("unmount", ...args);
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
