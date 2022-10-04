export class WorkflowLoaderHelperKit {
  /**
   * @param  {(id: string) => any} findComponentById
   * @param  {(id: string) => any} findFunctionById
   */
  constructor(findComponentById, findFunctionById) {
    this.findComponentById = findComponentById;
    this.findFunctionById = findFunctionById;
  }
}
