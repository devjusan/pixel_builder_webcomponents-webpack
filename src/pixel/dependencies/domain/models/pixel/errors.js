export class PixelError extends Error {
  static Errors = {
    INVALID_PROJECT_VERSION: 'INVALID_PROJECT_VERSION',
    UNEXPECTED_ERROR_DURING_PARSING: 'UNEXPECTED_ERROR_DURING_PARSING',
    INVALID_WORKFLOW_FUNCTION_STATUS: 'INVALID_WORKFLOW_FUNCTION_STATUS',
    INVALID_WORKFLOW_JOINT_TYPE: 'INVALID_WORKFLOW_JOINT_TYPE',
    INVALID_COMPONENTS_BUCKET_MAP_TYPENAME: 'INVALID_COMPONENTS_BUCKET_MAP_TYPENAME',
  };

  constructor(type) {
    super(`PixelError: ${type}`);
    /**@type {string} */
    this.type = type;
  }
}