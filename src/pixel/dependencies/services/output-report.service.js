import { HttpClient } from '../../libs/at/http/index.js';
import tokenService from './token.service.js';

class OutputReportService {
  constructor() {}

  #url = (key) => `https://output-test.atfunctions.com/api/output/generate_output?IAMKEY=${key}`;

  generateOutput(data) {
    console.log(data);
    return HttpClient.post(this.#url(tokenService.getToken()), data, { responseType: 'blob' });
  }
}

export default new OutputReportService();
