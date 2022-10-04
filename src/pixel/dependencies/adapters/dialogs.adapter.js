import { WebComponent } from '../../libs/at/core/index.js';

export class DialogConfig {
  static Confirmations = {
    Changes_Would_Be_Lost: {
      Title: 'Os dados serão perdidos',
      Body: 'Todos os dados já imputados nos componentes serão perdidos. Você pode recarregar o seu Pixel com uma versão compatível anteriormente salva. Deseja continuar mesmo assim?',
    },
  };

  /**
   * @param  {string} view
   * @param  {{Title: string; Body: string;}|() => {Title: string; Body: string;}} msg
   * @param  {{ fn: ()=>void, title: string }} primaryAction
   * @param  {{ fn: ()=>void, title: string }} secondaryAction
   */
  constructor(view, msg, primaryAction, secondaryAction) {
    const { Title, Body } = typeof msg === 'function' ? msg() : msg;

    this.view = view;
    this.title = Title;
    this.description = Body;
    this.primaryAction = primaryAction;
    this.secondaryAction = secondaryAction;
  }
}

export class SimpleDialogConfig {
  static Confirmations = {};

  /**
   * @param  {string} view
   * @param  {{Title: string; Body: string;}} msg
   * @param  {{ handler: ()=>void, title: string }} action
   */
  constructor(view, msg, action) {
    const { Title, Body } = msg;

    this.view = view;
    this.title = Title;
    this.description = Body;
    this.action = action;
  }
}

export default class DialogAdapter extends WebComponent {
  /**
   * @param  {DialogConfig | SimpleDialogConfig} config
   */
  setDialogConfig(config) {
    this.config = config;
  }
}
