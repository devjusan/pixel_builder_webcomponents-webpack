const container = document.getElementById("pixel_builder_container");

container.onload = async function () {
  await import("./pixel/modules.js").then(async () => {
    const stageEl = document.createElement("widget-stage");
    stageEl.id = "pixelbuilder_valuation";
    container.appendChild(stageEl);

    await import("./pixel/scopedStyles.js");
  });
};
