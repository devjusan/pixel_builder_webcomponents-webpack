import { PixelComponent } from '../paginator/pixel-component.model.js';
import { PixelWorkflowJoint } from '../helpers/workflow-joint.js';

export class PixelWorkflowMultipleOutcomesEntry {
  /**
   * @param  {PixelComponent} component
   * @param  {string} id?
   */
  constructor(component, id) {
    /**@type {string} */
    this.id = id;
    /**@type {PixelComponent} */
    this.component = component;
  }

  toJSON() {
    return {
      id: this.id,
      component: this.component
        ? new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.COMPONENT, this.component.id)
        : new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.UNSET),
    };
  }
}
