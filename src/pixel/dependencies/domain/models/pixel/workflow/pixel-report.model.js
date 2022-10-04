import { PixelWorkflowJoint } from '../helpers/workflow-joint.js';
import { PixelComponent } from '../paginator/pixel-component.model.js';

export class PixelWorkflowReport {
  /**
   * @param  {string} id
   * @param  {string} externalId
   * @param  {string} title
   * @param  {PixelComponent} trigger
   * @param  {PixelWorkflowReportEntry[]} entries
   */
  constructor(id, externalId, title, trigger, entries) {
    this.id = id;
    this.externalId = externalId;
    this.title = title;
    this.trigger = trigger;
    this.entries = entries;
  }

  toJSON() {
    return {
      id: this.id,
      externalId: this.externalId,
      title: this.title,
      trigger:
        this.trigger instanceof PixelComponent
          ? new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.COMPONENT, this.trigger.id)
          : new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.UNSET),
      entries: this.entries.map((entry) => {
        const token =
          entry.token instanceof PixelComponent
            ? new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.COMPONENT, entry.token.id)
            : new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.UNSET);
        const childrens =
          entry.childrens.map((child) => {
            return {
              ...child,
              token: new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.COMPONENT, child.token.id),
            };
          }) ?? [];

        return {
          id: entry.id,
          title: entry.title,
          token,
          childrens,
        };
      }),
    };
  }
}

export class PixelWorkflowReportEntry {
  /**
   * @param  {PixelComponent} token
   * @param  { string } title
   * @param  { number } id
   * @param  { {text: string, token: PixelComponent}[] } childrens
   */
  constructor(token, title, id, childrens) {
    this.token = token;
    this.title = title;
    this.id = id;
    this.childrens = childrens;
  }
}
