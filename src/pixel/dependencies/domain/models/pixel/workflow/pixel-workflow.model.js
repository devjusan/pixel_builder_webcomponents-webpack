import { PixelWorkflowFunction } from './pixel-function.model.js';
import { PixelWorkflowSingleOutcomeEntry } from './pixel-single-outcome-entry.model.js';
import { PixelWorkflowMultipleOutcomesEntry } from './pixel-multiple-outcomes-entry.model.js';
import { PixelWorkflowReport, PixelWorkflowReportEntry } from './pixel-report.model.js';
import { PixelComponent } from '../paginator/pixel-component.model.js';
import { WorkflowLoaderHelperKit } from '../helpers/workflow-loader-helper-kit.js';
import { PixelWorkflowJoint } from '../helpers/workflow-joint.js';

export class PixelWorkflow {
  /** @type{PixelComponent|null} */
  #trigger;
  /** @type{PixelComponent|null} */
  #saveTrigger;
  /** @type{PixelComponent|null} */
  #loadTrigger;
  /** @type{PixelWorkflowFunction[]} */
  #functions;
  /** @type{PixelWorkflowSingleOutcomeEntry[]} */
  #singleOutcomeEntries;
  /** @type{PixelWorkflowMultipleOutcomesEntry[]} */
  #multipleOutcomesEntries;
  /** @type{PixelWorkflowReport[]} */
  #reports;

  get trigger() {
    return this.#trigger;
  }

  set trigger(trigger) {
    this.#trigger = trigger;
  }

  get saveTrigger() {
    return this.#saveTrigger;
  }

  set saveTrigger(saveTrigger) {
    this.#saveTrigger = saveTrigger;
  }

  get loadTrigger() {
    return this.#loadTrigger;
  }

  set loadTrigger(loadTrigger) {
    this.#loadTrigger = loadTrigger;
  }

  get functions() {
    return this.#functions;
  }

  set functions(functions) {
    this.#functions = functions;
  }

  get singleOutcomeEntries() {
    return this.#singleOutcomeEntries;
  }

  set singleOutcomeEntries(singleOutcomeEntries) {
    this.#singleOutcomeEntries = singleOutcomeEntries;
  }

  get multipleOutcomesEntries() {
    return this.#multipleOutcomesEntries;
  }

  set multipleOutcomesEntries(multipleOutcomesEntries) {
    this.#multipleOutcomesEntries = multipleOutcomesEntries;
  }

  get reports() {
    return this.#reports;
  }

  set reports(reports) {
    this.#reports = reports;
  }

  constructor(trigger, saveTrigger, loadTrigger, functions, singleOutcomeEntries, multipleOutcomesEntries, reports) {
    this.#trigger = trigger;
    this.#saveTrigger = saveTrigger;
    this.#loadTrigger = loadTrigger;
    this.#functions = functions ?? [];
    this.#singleOutcomeEntries = singleOutcomeEntries ?? [];
    this.#multipleOutcomesEntries = multipleOutcomesEntries ?? [];
    this.#reports = reports ?? [];
  }

  findFunctionById(id) {
    return this.functions.find((fn) => fn.id === id);
  }

  /**
   * @param  {PixelWorkflowFunction[]} functions
   */
  setFunctions(functions) {
    this.functions = functions;
  }

  /**
   * @param  {PixelWorkflowSingleOutcomeEntry[]} singleOutcomeEntries
   */
  setSingleOutcomeEntries(singleOutcomeEntries) {
    this.singleOutcomeEntries = singleOutcomeEntries;
  }

  /**
   * @param  {PixelWorkflowMultipleOutcomesEntry[]} multipleOutcomesEntries
   */
  setMultipleOutcomesEntries(multipleOutcomesEntries) {
    this.multipleOutcomesEntries = multipleOutcomesEntries;
  }

  /**
   * @param  {PixelWorkflowReport[]} reports
   */
  setReports(reports) {
    this.reports = reports;
  }

  /**
   * @param {WorkflowLoaderHelperKit} helperKit
   */
  fromJSON(workflow, helperKit) {
    const { trigger, saveTrigger, loadTrigger, functions, singleOutcomeEntries, multipleOutcomeEntries, reports } =
      workflow;

    this.trigger = PixelWorkflowJoint.parse(trigger, helperKit);
    this.saveTrigger = PixelWorkflowJoint.parse(saveTrigger, helperKit);
    this.loadTrigger = PixelWorkflowJoint.parse(loadTrigger, helperKit);
    this.__parseWorkflowFunctions(functions, helperKit);
    this.__parseWorkflowMultipleOutcomesEntries(multipleOutcomeEntries, helperKit);
    this.__parseWorkflowSingleOutcomeEntries(singleOutcomeEntries, helperKit);
    this.__parseWorkflowReports(reports, helperKit);
  }

  /**
   * @param {WorkflowLoaderHelperKit} helperKit
   */
  __parseWorkflowFunctions(functions, helperKit) {
    this.setFunctions(functions.map((fn) => PixelWorkflowFunction.fromJSON(fn, helperKit)));
  }

  /**
   * @param {WorkflowLoaderHelperKit} helperKit
   */
  __parseWorkflowSingleOutcomeEntries(singleOutcomeEntries, helperKit) {
    this.setSingleOutcomeEntries(
      singleOutcomeEntries.map(
        (soEntry) =>
          new PixelWorkflowSingleOutcomeEntry(
            PixelWorkflowJoint.parse(soEntry.component, helperKit),
            PixelWorkflowJoint.parse(soEntry.storeToken, helperKit),
            soEntry.id
          )
      )
    );
  }

  /**
   * @param {WorkflowLoaderHelperKit} helperKit
   */
  __parseWorkflowMultipleOutcomesEntries(multipleOutcomesEntries, helperKit) {
    this.setMultipleOutcomesEntries(
      multipleOutcomesEntries.map(
        (mOEntry) =>
          new PixelWorkflowMultipleOutcomesEntry(PixelWorkflowJoint.parse(mOEntry.component, helperKit), mOEntry.id)
      )
    );
  }

  /**
   * @param {PixelWorkflowReport[]} reports
   * @param {WorkflowLoaderHelperKit} helperKit
   */
  __parseWorkflowReports(reports, helperKit) {
    this.setReports(
      reports.map((report) => {
        const hydratedEntries = report.entries.map((entry) => {
          const childrens =
            entry.childrens.map((child) => {
              return { ...child, token: PixelWorkflowJoint.parse(child.token, helperKit) };
            }) ?? [];

          return new PixelWorkflowReportEntry(
            PixelWorkflowJoint.parse(entry.token, helperKit),
            entry.title,
            entry.id,
            childrens
          );
        });

        return new PixelWorkflowReport(
          report.id,
          report.externalId,
          report.title,
          PixelWorkflowJoint.parse(report.trigger, helperKit),
          hydratedEntries
        );
      })
    );
  }

  toJSON() {
    return {
      trigger:
        this.trigger instanceof PixelComponent
          ? new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.COMPONENT, this.trigger.id)
          : new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.UNSET),
      saveTrigger:
        this.saveTrigger instanceof PixelComponent
          ? new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.COMPONENT, this.saveTrigger.id)
          : new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.UNSET),
      loadTrigger:
        this.loadTrigger instanceof PixelComponent
          ? new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.COMPONENT, this.loadTrigger.id)
          : new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.UNSET),
      functions: this.functions,
      singleOutcomeEntries: this.singleOutcomeEntries,
      multipleOutcomeEntries: this.multipleOutcomesEntries,
      reports: this.reports,
    };
  }
}
