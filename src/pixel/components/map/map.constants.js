import { UUIDUtils } from '../../dependencies/utils/index.js';

export const MAP = Object.freeze({
  SOURCE: {
    AERIAL: { KEY: 'AvX3oe7eZ2Pd_dxpVAEAiAhWxB97PXd3-o5on_n2MI9wi2GoBKxc89m_UgvBa6bh', IMAGERY_SET: 'Aerial' },
    UF: { PARAMS: { LAYERS: 'atpro:estados' }, SERVER_TYPE: 'geoserver' },
  },
  NAMES: { AERIAL: 'Imagem de Satélite', UF: 'Estados', HIGHLIGHT: 'highlightOverlay' },
  FROM: 'pixel-builder',
  CONFIG: {
    GEOSERVER_URL: 'https://map.atfunctions.com:8443/geoserver/atpro/wms',
    EPSG: {
      EPSG3857: 'EPSG:3857',
      EPSG4326: 'EPSG:4326',
    },
  },
  COORDS: { CENTER_POINT: [-6154098.021296111, -1937220.0448595071], MAX_EXTENT: [-170, -70, 180, 78.5] },
});

export const PLACEHOLDER = Object.freeze({
  COORDS: [
    {
      name: 'Nome da geometria',
      placeholder: 'Digite o nome...',
      element: 'app-pixel-input-block',
      key: UUIDUtils.getRandomId(),
    },
    { name: 'Latitude', placeholder: '-55.673982', element: 'app-pixel-input-block', key: UUIDUtils.getRandomId() },
    { name: 'Longitude', placeholder: '-12.461418', element: 'app-pixel-input-block', key: UUIDUtils.getRandomId() },
    { name: 'Adicionar entradas', placeholder: '', element: 'span', key: UUIDUtils.getRandomId() },
    {
      name: 'Ocorreu um erro. Verifique os campos.',
      placeholder: '',
      element: 'p',
      key: UUIDUtils.getRandomId(),
      classNames: ['on-error', 'error-container', 'hide'],
    },
  ],
  GEOM: [
    {
      name: 'Nome da geometria',
      placeholder: 'Digite o nome...',
      element: 'app-pixel-input-block',
      key: UUIDUtils.getRandomId(),
    },
    {
      name: 'WKT',
      placeholder:
        'MULTIPOLYGON(((-50.43410526370004021 -29.87398556396616556, -50.4305881477565805 -29.87942110678787699, -50.43708948328843178 -29.89146456441245192, -50.44780070002533279 -29.88619555170170017, -50.45360927029559406 -29.88400401544147655, -50.44028686141884776 -29.87878163116179309, -50.43410526370004021 -29.87398556396616556)))',
      element: 'app-pixel-input-block',
      key: UUIDUtils.getRandomId(),
    },
    { name: 'Adicionar entradas', placeholder: '', element: 'span', key: UUIDUtils.getRandomId() },
    {
      name: 'Ocorreu um erro. Verifique os campos.',
      placeholder: '',
      element: 'p',
      key: UUIDUtils.getRandomId(),
      classNames: ['on-error', 'error-container', 'hide-error'],
    },
  ],
});
