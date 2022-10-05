import scopedStyles from "./pixel/scopedStyles.js";

const container = document.getElementById("pixel_builder_container");

container.onload = async function () {
  await import("./pixel/modules.js").then(() => {
    const stageEl = document.createElement("widget-stage");
    stageEl.id = "pixelbuilder_valuation";

    scopedStyles(container);

    container.appendChild(stageEl);
  });
};
