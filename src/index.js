import("./pixel/insertCdn.js").then(async () => {
  await import("./pixel/modules.js").then(async () => {
    const stageEl = document.createElement("widget-stage");
    const container = document.getElementById("pixel_builder_container");
    stageEl.id = "pixelbuilder_valuation";
    container.appendChild(stageEl);

    await import("./pixel/scopedStyles.js");
  });
});
