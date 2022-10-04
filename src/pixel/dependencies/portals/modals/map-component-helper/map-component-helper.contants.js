import { UUIDUtils } from '../../../utils/index.js';

export const PLACEHOLDER = Object.freeze({
  LIST: [
    {
      name: 'Grossura',
      placeholder: 'Digite aqui...',
      element: 'app-pixel-input-block',
      key: UUIDUtils.getRandomId(),
      type: 'size',
      inputType: 'number',
      customAttributes: [{ 'input.max': 10 }, { 'input.min': 0 }],
    },
    {
      name: 'Cor da grossura',
      placeholder: 'Digite aqui...',
      element: 'app-pixel-input-block',
      key: UUIDUtils.getRandomId(),
      type: 'stroke',
      inputType: 'color',
    },
    {
      name: 'Cor interna',
      placeholder: 'Digite aqui...',
      element: 'app-pixel-input-block',
      key: UUIDUtils.getRandomId(),
      type: 'fill',
      inputType: 'color',
    },
    {
      name: 'Sublinhado',
      placeholder: '',
      element: 'app-pixel-checkbox-block',
      key: UUIDUtils.getRandomId(),
      type: 'underlined',
      inputType: 'checkbox',
    },
    {
      name: 'Opacidade cor interna',
      placeholder: '0.1',
      element: 'app-pixel-input-block',
      key: UUIDUtils.getRandomId(),
      type: 'opacity',
      inputType: 'number',
      customAttributes: [{ 'input.step': 0.1 }, { 'input.max': 1 }, { 'input.min': 0 }],
    },
    {
      name: 'Nome',
      placeholder: 'Digite aqui...',
      element: 'app-pixel-input-block',
      key: UUIDUtils.getRandomId(),
      type: 'name',
      inputType: 'string',
    },
  ],
});
