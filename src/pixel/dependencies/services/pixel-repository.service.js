import { HttpClient } from '../../libs/at/http/index.js';
import tokenService from './token.service.js';
import * as Rxjs from 'rxjs';

class PixelRepositoryService {
  constructor() {}

  #url = (action, key, id) => `https://pixelbuilderapi-test-aks.atfunctions.com/pixel/${action}/${id}?IAMKEY=${key}`;

  getPixelById(id) {
    return HttpClient.get(this.#url(`show`, tokenService.getToken(), id)).pipe(
      Rxjs.shareReplay(1),
      Rxjs.map((response) => response.data?.objectResult[0])
    );
  }
}

export default new PixelRepositoryService();
