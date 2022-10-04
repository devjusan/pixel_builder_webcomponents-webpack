import { PixelProps } from './pixel-props.model.js';
import { PixelPaginator } from './paginator/pixel-paginator.model.js';
import { PixelWorkflow } from './workflow/pixel-workflow.model.js';
import { PixelError } from './errors.js';
import { WorkflowLoaderHelperKit } from './helpers/workflow-loader-helper-kit.js';

export class Pixel {
  static get version() {
    return 'v1.0.0-beta.3';
  }

  /** @type {PixelProps}  */
  #props;
  /** @type {PixelPaginator}  */
  #paginator;
  /** @type {PixelWorkflow}  */
  #workflow;

  get props() {
    return this.#props;
  }

  /**  @param  {PixelProps} props */
  setProps(props) {
    this.#props = props;
  }

  get paginator() {
    return this.#paginator;
  }

  /**  @param  {PixelPaginator} paginator */
  setPaginator(paginator) {
    this.#paginator = paginator;
  }

  get workflow() {
    return this.#workflow;
  }

  /**  @param  {PixelWorkflow} workflow */
  setWorkflow(workflow) {
    this.#workflow = workflow;
  }

  /**
   * @param  {PixelProps} props
   * @param  {PixelPaginator} paginator
   * @param  {PixelWorkflow} workflow
   */
  constructor(props, paginator, workflow) {
    this.#props = props;
    this.#paginator = paginator;
    this.#workflow = workflow;
  }

  /**
   * @param {string} id
   * @returns {EditablePixelComponent | undefined}
   */
  findComponentById(id) {
    return this.paginator.findComponentById(id);
  }

  /**
   * @param {string} id
   * @returns {EditablePixelWorkflowFunction}
   */
  findWorkflowFunctionById(id) {
    return this.workflow.findFunctionById(id);
  }

  fromJSON(projectSource) {
    try {
      const { version, props, paginator, workflow } = JSON.parse(projectSource);

      if (version !== Pixel.version) throw new PixelError(PixelError.Errors.INVALID_PROJECT_VERSION);

      this.__parseProps(props);
      this.__parsePaginator(paginator);
      this.__parseWorkflow(
        workflow,
        new WorkflowLoaderHelperKit(this.findComponentById.bind(this), this.findWorkflowFunctionById.bind(this))
      );

      return this;
    } catch (err) {
      if (err instanceof PixelError) throw err;
      else {
        console.error(err);
        throw new PixelError(PixelError.Errors.UNEXPECTED_ERROR_DURING_PARSING);
      }
    }
  }

  __parseProps(props) {
    this.props.fromJSON(props);
  }

  __parsePaginator(paginator) {
    this.paginator.fromJSON(paginator);
  }

  __parseWorkflow(workflow, helperKit) {
    this.workflow.fromJSON(workflow, helperKit);
  }

  toJSON() {
    return {
      version: Pixel.version,
      props: this.props,
      paginator: this.paginator,
      workflow: this.workflow,
    };
  }
}
