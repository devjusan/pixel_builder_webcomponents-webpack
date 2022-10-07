import { IconUtils } from '../../../dependencies/index.js';
import { WebComponent } from '../../../libs/at/core/index.js';
import BoxInfo from '../box-info/box-info.js';
import { MAP } from '../map.constants.js';
import template from './map-initializer.html';
import styles from './map-initializer.css';

export default class MapInitializer extends WebComponent {
  /** @type {BoxInfo} */
  boxInfoEl;

  constructor() {
    super(template, styles);
  }

  onInit() {
    this.init();
    this.mapViewPort = this.querySelector('.ol-viewport');
    this.boxInfoEl = document.createElement('app-box-info');

    this.mapViewPort.appendChild(this.boxInfoEl);
    this.mapViewPort.appendChild(this.#generateWindRose());
  }

  componentDidMount() {
    this.#updateMapSize();
  }

  init() {
    if (!this.mounted && !this.mounting) {
      return;
    }

    this.mapInstance = new ol.Map({
      interactions: ol.interaction.defaults({ doubleClickZoom: true }),
      controls: ol.control.defaults({
        attribution: false,
        zoom: false,
      }),
      layers: [this.#bindMapsAerialLayer()],
      target: this,
      view: this.#bindView(),
    });

    const scaleLine = new ol.control.ScaleLine({
      className: 'ol-scale-line',
      steps: 4,
      text: false,
    });

    this.mapInstance.addControl(scaleLine);
  }

  approach(item) {
    let feature = null;

    const format = new ol.format.WKT();
    let properties = { area: item.area, gid: item.gid, ogc_fid: item.ogc_fid, nome: item.title };
    if (!Array.isArray(item.value)) {
      feature = format.readFeature(item.value, {
        dataProjection: MAP.CONFIG.EPSG.EPSG4326,
        featureProjection: MAP.CONFIG.EPSG.EPSG3857,
      });
    } else {
      const coords = item.value.reverse().slice(0, 2);

      const point = new ol.geom.Point(coords);
      const feat = new ol.Feature({
        geometry: point,
        name: item.title,
      });
      const wkt = format.writeGeometry(feat.getGeometry());

      feature = format.readFeature(wkt, {
        dataProjection: MAP.CONFIG.EPSG.EPSG4326,
        featureProjection: MAP.CONFIG.EPSG.EPSG3857,
      });

      properties = { ...item };
    }

    feature.setProperties(properties);

    const layer = this.#generateLayer(item.title);
    layer.getSource().clear();
    layer.getSource().addFeatures([feature]);

    this.mapInstance.addLayer(layer);
    this.mapInstance.getView().fit(layer.getSource().getExtent());
    this.mapInstance.getView().setZoom(this.mapInstance.getView().getZoom() - 2);
    this.addLegend(item);
  }

  removeLayer(fileName, item) {
    this.mapInstance
      .getLayers()
      .getArray()
      .forEach((layer) => {
        if (layer.values_.name === fileName) {
          this.mapInstance.removeLayer(layer);
          this.removeLegend(item);
        }
      });
  }

  updateLayersIndex() {
    if (!this.mapInstance) return null;

    const layersList = this.mapInstance.getLayers().getArray();

    if (!layersList.length) {
      return null;
    }

    let j = 1;
    for (let i = 1; i <= layersList; ++i) {
      const layer = layersList[i];

      layer.setZIndex(i);
    }
  }

  changeLayerName(item, newName) {
    this.mapInstance
      .getLayers()
      .getArray()
      .forEach((layer) => {
        if (layer.values_.name === item.oldName) {
          layer.set('name', newName);
        }
      });
  }

  changeLayerStyle(item, size, color, fill, lineDash, opacity) {
    this.mapInstance
      .getLayers()
      .getArray()
      .forEach((layer) => {
        if (layer.values_.name === item.title || layer.values_.name === item.oldName) {
          const style = this.#setStyle(Number(size), color, fill, lineDash, opacity);
          layer.setStyle(style);
          this.addLegend({ ...item, size, color, fill, lineDash, opacity });
        }
      });
  }

  getLayer(name) {
    return this.mapInstance
      .getLayers()
      .getArray()
      .find((layer) => layer.values_.name === name);
  }

  addLegend(legend) {
    this.boxInfoEl.addLegendOrUpdate(legend);
  }

  removeLegend(legend) {
    this.boxInfoEl.removeLegend(legend);
  }

  print() {
    return htmlToImage
      .toCanvas(this, {
        width: 1371,
        height: 740,
        useCORS: true,
        quality: 0.4,
      })
      .then(this.#saveScreenshot);
  }

  #saveScreenshot(canvas) {
    const dataURL = canvas.toDataURL('image/png');

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
  }

  #updateMapSize() {
    if (!this.mapInstance) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (this === entry.target) {
          this.mapInstance.updateSize();
        }
      }
    });

    resizeObserver.observe(this);

    this.registerOnUnmount(() => {
      resizeObserver.unobserve(this);
    });
  }

  #bindMapsAerialLayer() {
    return new ol.layer.Tile({
      name: MAP.NAMES.AERIAL,
      preload: Infinity,
      source: new ol.source.BingMaps({
        key: MAP.SOURCE.AERIAL.KEY,
        imagerySet: MAP.SOURCE.AERIAL.IMAGERY_SET,
      }),
      zIndex: 0,
      from: MAP.FROM,
    });
  }

  #bindView() {
    const centerPoint = MAP.COORDS.CENTER_POINT;
    const maxExtent = ol.proj.transformExtent(
      MAP.COORDS.MAX_EXTENT,
      MAP.CONFIG.EPSG.EPSG4326,
      MAP.CONFIG.EPSG.EPSG3857
    );

    return new ol.View({
      center: centerPoint,
      extent: maxExtent,
      zoom: 4,
      minZoom: 4,
      maxZoom: 19,
    });
  }

  /** @param {string} title */
  #generateLayer(title) {
    return new ol.layer.Vector({
      name: title,
      source: new ol.source.Vector({}),
      style: [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 255, 1)',
            width: 3,
            lineDash: undefined,
          }),
          fill: new ol.style.Fill({
            color: 'rgba(0, 0, 0, 0.2)',
          }),
        }),
      ],
      zIndex: 1,
      from: MAP.FROM,
    });
  }

  #setStyle(size, color, fill, lineDash, opacity) {
    let fillAsArray = ol.color.asArray(fill).slice();
    fillAsArray[3] = Number(opacity);

    return [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: color ?? 'rgba(0, 0, 255, 1)',
          width: size ?? 3,
          lineDash: lineDash ? [6] : undefined,
        }),
        fill: new ol.style.Fill({
          color: fillAsArray ?? 'rgba(0, 0, 0, 0.2)',
        }),
      }),
    ];
  }

  #generateWindRose() {
    const iconEl = IconUtils.createIcon('wind-rose', '200', 'white');

    iconEl.classList.add('wind-rose');

    return iconEl;
  }
}

customElements.define('app-map-initializer', MapInitializer);
