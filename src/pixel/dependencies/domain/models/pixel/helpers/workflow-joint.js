import { PixelWorkflowStoreToken } from '../workflow/pixel-store-token.model.js';
import { PixelError } from '../errors.js';
import { WorkflowLoaderHelperKit } from './workflow-loader-helper-kit.js';

export class PixelWorkflowJoint {
  /**@typedef {'COMPONENT'|'STORE_TOKEN'|'UNSET'} JointType */

  static JointTypeEnum = {
    COMPONENT: 'COMPONENT',
    STORE_TOKEN: 'STORE_TOKEN',
    UNSET: 'UNSET',
  };

  static #parseHandlers = {
    [this.JointTypeEnum.UNSET]: () => undefined,
    /** @param  {WorkflowLoaderHelperKit} helperKit */
    [this.JointTypeEnum.COMPONENT]: (data, helperKit) => helperKit.findComponentById(data),
    /** @param  {WorkflowLoaderHelperKit} helperKit */
    [this.JointTypeEnum.STORE_TOKEN]: (data, helperKit) => {
      let { fn, field } = data;

      if (fn && field) {
        fn = helperKit.findFunctionById(fn);
      }

      return new PixelWorkflowStoreToken(fn, field);
    },
    DEFAULT: () => {
      throw new PixelError(PixelError.Errors.INVALID_WORKFLOW_JOINT_TYPE);
    },
    getParser: (type) => this.#parseHandlers[type] ?? this.#parseHandlers.DEFAULT,
  };

  /**
   * @param {JointType} type
   * @param {string | {fn: string, field: string;}|undefined} data
   */
  constructor(type, data) {
    /** @type {JointType} */
    this.type = PixelWorkflowJoint.JointTypeEnum[type];
    /** @type {string | {fn: string, field: string;}|undefined} */
    this.data = data;
  }

  /**
   * @param {WorkflowLoaderHelperKit} helperKit
   */
  static parse(workflowJoint, helperKit) {
    if (!workflowJoint) {
      return this.#parseHandlers.getParser(this.JointTypeEnum.UNSET)();
    }

    const { type, data } = workflowJoint;

    return this.#parseHandlers.getParser(type)(data, helperKit);
  }
}
