import { HttpClient } from "../../libs/at/http/index.js";
import tokenService from "./token.service.js";

class PixelRepositoryService {
  constructor() {}

  #url = (action, key, id) =>
    `https://pixelbuilderapi-test-aks.atfunctions.com/pixel/${action}/${id}?IAMKEY=${key}`;

  getPixelById(id) {
    return HttpClient.get(this.#url(`show`, tokenService.getToken(), id)).pipe(
      rxjs.operators.map((response) => response.data?.objectResult[0])
    );
  }
}

export default new PixelRepositoryService();
