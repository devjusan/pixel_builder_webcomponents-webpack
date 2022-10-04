import { PixelError } from '../errors.js';
import { WorkflowLoaderHelperKit } from '../helpers/workflow-loader-helper-kit.js';
import { PixelWorkflowJoint } from '../helpers/workflow-joint.js';
import { PixelWorkflowStoreToken } from './pixel-store-token.model.js';
import { PixelComponent } from '../paginator/pixel-component.model.js';

export class PixelWorkflowFunction {
  static StatusTypeMap = {
    PRIMITIVE: 'PRIMITIVE',
    PENDING: 'PENDING',
    OK: 'OK',
  };

  static getPrimitiveInstance(collectionId, id) {
    return new PixelWorkflowFunction(id, {
      collectionId,
      status: PixelWorkflowFunction.StatusTypeMap.PRIMITIVE,
    });
  }

  static getPendingInstance(data, id) {
    return new PixelWorkflowFunction(
      id,
      Object.assign(data, {
        status: PixelWorkflowFunction.StatusTypeMap.PENDING,
      })
    );
  }

  static getOkInstance(data, id) {
    return new PixelWorkflowFunction(
      id,
      Object.assign(data, {
        status: PixelWorkflowFunction.StatusTypeMap.OK,
      })
    );
  }

  static #ParseHandlers = {
    [this.StatusTypeMap.PRIMITIVE]: (fn) => this.getPrimitiveInstance(fn.collectionId, fn.id),
    /** @param  {WorkflowLoaderHelperKit} helperKit */
    [this.StatusTypeMap.PENDING]: (fn, helperKit) => {
      const { id, externalId, url, requestMethod, fieldEntriesMap } = fn;
      const workflowFn = this.getPendingInstance(
        {
          externalId,
          url,
          requestMethod,
          fieldEntriesMap: this.__parseFieldEntriesMap(fieldEntriesMap, helperKit),
        },
        id
      );

      return workflowFn;
    },
    /** @param  {WorkflowLoaderHelperKit} helperKit */
    [this.StatusTypeMap.OK]: (fn, helperKit) => {
      const { id, externalId, url, requestMethod, fieldEntriesMap } = fn;
      const workflowFn = this.getOkInstance(
        {
          externalId,
          url,
          requestMethod,
          fieldEntriesMap: this.__parseFieldEntriesMap(fieldEntriesMap, helperKit),
        },
        id
      );

      return workflowFn;
    },
    DEFAULT: () => {
      throw new PixelError(PixelError.Errors.INVALID_WORKFLOW_FUNCTION_STATUS);
    },
    getHandler: (status) => this.#ParseHandlers[status] ?? this.#ParseHandlers.DEFAULT,
  };

  /**
   * @param {string|undefined} id
   * @param {{
   *  status: "PRIMITIVE"|"PENDING"|"OK";
   *  collectionId?: number;
   *  externalId?: number;
   *  url?: string;
   *  requestMethod?: string;
   *  fieldEntriesMap?: Object.<string, PixelComponent | PixelWorkflowStoreToken>;
   * }} data
   */
  constructor(id, data) {
    this.id = id;
    this.status = data.status;

    if (this.status === PixelWorkflowFunction.StatusTypeMap.PRIMITIVE) {
      const { collectionId } = data;

      this.collectionId = collectionId;
      this.fieldEntriesMap = {};
    } else {
      const { externalId, url, requestMethod, fieldEntriesMap, outcomeFields } = data;

      this.externalId = externalId;
      this.fieldEntriesMap = fieldEntriesMap;
      this.url = url;
      this.requestMethod = requestMethod;
      this.outcomeFields = outcomeFields ?? [];
    }
  }

  /** @param  {WorkflowLoaderHelperKit} helperKit */
  static fromJSON(fn, helperKit) {
    return PixelWorkflowFunction.#ParseHandlers.getHandler(fn.status)(fn, helperKit);
  }

  /** @param  {WorkflowLoaderHelperKit} helperKit */
  static __parseFieldEntriesMap = (fieldEntriesMap, helperKit) =>
    Object.entries(fieldEntriesMap).reduce((__fieldEntriesMap, [field, nextFnJoint]) => {
      __fieldEntriesMap[field] = PixelWorkflowJoint.parse(nextFnJoint, helperKit);
      return __fieldEntriesMap;
    }, {});

  toJSON() {
    if (this.status === PixelWorkflowFunction.StatusTypeMap.PRIMITIVE) {
      return {
        status: this.status,
        id: this.id,
        collectionId: this.collectionId,
        fieldEntriesMap: {},
        outcomeFields: this.outcomeFields,
      };
    }

    return {
      status: this.status,
      id: this.id,
      collectionId: this.collectionId,
      externalId: this.externalId,
      url: this.url,
      requestMethod: this.requestMethod,
      fieldEntriesMap: Object.entries(this.fieldEntriesMap).reduce((acc, nextFieldTuple) => {
        const [field, value] = nextFieldTuple;

        if (value instanceof PixelComponent) {
          acc[field] = new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.COMPONENT, value.id);
        } else if (value instanceof PixelWorkflowStoreToken) {
          acc[field] = new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.STORE_TOKEN, value);
        } else {
          acc[field] = new PixelWorkflowJoint(PixelWorkflowJoint.JointTypeEnum.UNSET);
        }

        return acc;
      }, {}),
      outcomeFields: this.outcomeFields,
    };
  }
}
