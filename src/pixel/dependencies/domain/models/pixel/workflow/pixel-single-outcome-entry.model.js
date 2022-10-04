import { PixelComponent } from '../paginator/pixel-component.model.js';
import { PixelWorkflowStoreToken } from './pixel-store-token.model.js';
import { PixelWorkflowJoint } from '../helpers/workflow-joint.js';

export class PixelWorkflowSingleOutcomeEntry {
  /**
   * @param  {PixelComponent} component
   * @param  {PixelWorkflowStoreToken} storeToken
   * @param  {string} id?
   */
  constructor(component, storeToken, id) {
    /**@type {string} */
    this.id = id;
    /**@type {PixelComponent} */
    this.component = component;
    /**@type {PixelWorkflowStoreToken} */
    this.storeToken = storeToken;
  }

  toJSON() {
    return {
      id: this.id,
      component: this.component
        ? new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.COMPONENT, this.component.id)
        : new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.UNSET),
      storeToken: new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.STORE_TOKEN, this.storeToken),
    };
  }
}
