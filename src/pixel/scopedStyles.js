import index from "./styles/index.css";
import ui from "./styles/ui.css";
import overridenLibs from "./styles/overriden-libs.css";
import vars from "./styles/vars.css";

(function () {
  const root = document.getElementById("pixel_builder_container");
  const styles = [index, ui, overridenLibs, vars];

  styles.forEach((style) => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = style;
    root.appendChild(styleEl);
  });
})();
