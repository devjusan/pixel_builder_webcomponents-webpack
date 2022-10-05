const scriptList = [
  {
    type: "link",
    src: "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.structure.min.css",
  },
  {
    type: "link",
    src: "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css",
  },
  {
    type: "link",
    src: "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
  },
  {
    type: "link",
    src: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.css",
  },
  {
    type: "link",
    src: "https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.5.0/css/ol.css",
  },
  {
    type: "script",
    src: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js",
  },
  {
    type: "script",
    src: "https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.5.0/build/ol.js",
  },
  {
    type: "script",
    src: "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js",
  },
  {
    type: "script",
    src: "https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js",
  },
  {
    type: "script",
    src: "https://cdnjs.cloudflare.com/ajax/libs/rxjs/7.1.0/rxjs.umd.min.js",
  },
  {
    type: "script",
    src: "https://cdnjs.cloudflare.com/ajax/libs/navigo/8.11.1/navigo.min.js",
  },
  {
    type: "script",
    src: "https://cdnjs.cloudflare.com/ajax/libs/jquery-maskmoney/3.0.2/jquery.maskMoney.min.js",
  },
  {
    type: "script",
    src: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.js",
  },
  {
    type: "script",
    src: "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js",
  },
  {
    type: "script",
    src: "https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js",
  },
  {
    type: "script",
    src: "https://cdnjs.cloudflare.com/ajax/libs/uuid/8.1.0/uuidv4.min.js",
  },
  {
    src: "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.10.4/html-to-image.min.js",
    type: "script",
  },
  {
    type: "script",
    src: "https://cdn.jsdelivr.net/npm/ol-mapbox-style@6.1.4/dist/olms.js",
  },
];

let hasBeenExecuted = false;
(function () {
  if (hasBeenExecuted) return;
  hasBeenExecuted = true;

  let head = document.head;
  if (!head) {
    const headEl = document.createElement("head");
    document.head = headEl;
  }

  for (let index = 0; index < scriptList.length; index++) {
    const item = scriptList[index];
    let element = null;
    const hasElement = document.querySelector(`[key="${item.src}"]`);

    if (hasElement) {
      element = hasElement;
    } else {
      element = document.createElement(item.type);
    }

    if (item.type === "script") {
      element.setAttribute("async", "async");
      element.setAttribute("src", item.src);
    } else {
      element.setAttribute("href", item.src);
      element.setAttribute("rel", "stylesheet");
      element.setAttribute("type", "text/css");
      element.setAttribute("crossorigin", "anonymous");
    }

    element.setAttribute("key", item.src);
    document.head.appendChild(element);
  }
})();
