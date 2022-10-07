import { HttpClient } from '../../libs/at/http/index.js';
import tokenService from './token.service.js';
import * as Rxjs from 'rxjs';

class StoragePixelService {
  /** @typedef {Rxjs.BehaviorSubject<{storageName: string, storageId: number, folderId: number} | {}> } SelectedStorage */
  /** @typedef {'get_storage' | 'create_storage'| 'get_contents/folder'| 'open_file'| 'create_folder'| 'save_files'} Actions */

  /** @type {SelectedStorage} */
  #selectedStorage;

  #ACTIONS = {
    GET_STORAGE: 'get_storage',
    CREATE_STORAGE: 'create_storage',
    GET_CONTENTS: 'get_contents/folder',
    OPEN_FILE: 'open_file',
    CREATE_FOLDER: 'create_folder',
    CREATE_FILE: 'save_files',
  };

  constructor() {
    this.#selectedStorage = new Rxjs.BehaviorSubject({});
  }

  getStoragesObservable() {
    return this.#getStorages();
  }

  getSelectedStorage() {
    return this.#selectedStorage.asObservable();
  }

  /** @param {SelectedStorage} storage */
  setSelectedStorage(storage) {
    this.#selectedStorage.next(storage);
  }

  /**
   * @param {number} storageId
   * @param {number} FolderId
   * @param {'Folders' | 'Files'} select
   */
  getContentsObservable(storageId, FolderId, select) {
    return this.#getContents(storageId, FolderId).pipe(
      Rxjs.map((contents) => (select ? contents?.[select] : contents) ?? [])
    );
  }

  /**
   *  @param {{fileId: number}} data
   */
  openFile(data) {
    return HttpClient.post(this.#url(this.#ACTIONS.OPEN_FILE), data).pipe(
      Rxjs.map((response) => response.data.ObjectResult ?? [])
    );
  }

  /**
   * @param {string} fileName
   * @param {any} fileContent
   * @param {number} storageId
   * @param {number} folderId
   */
  uploadFile(fileName, fileContent, storageId, folderId) {
    const stringfyContent = JSON.stringify(fileContent);

    const blob = new Blob([stringfyContent], {
      type: `text/'plain'}`,
    });
    const file = new File([blob], `${fileName}.txt`);
    const formData = new FormData();

    formData.append('data', `{"files": [{"FolderId": ${folderId}}], "storageId": ${storageId}}`);
    formData.append('Files', file);

    return HttpClient.post(this.#url(this.#ACTIONS.CREATE_FILE), formData);
  }

  #getContents(storageId, FolderId) {
    return HttpClient.post(this.#url(this.#ACTIONS.GET_CONTENTS), {
      storageId,
      FolderId,
    }).pipe(
      Rxjs.map((response) => response.data?.ObjectResult ?? []),
      Rxjs.shareReplay(1)
    );
  }

  #getStorages() {
    return HttpClient.post(this.#url(this.#ACTIONS.GET_STORAGE)).pipe(
      Rxjs.map((response) => response.data?.ObjectResult ?? []),
      Rxjs.shareReplay(1)
    );
  }

  /** @param {Actions} action */
  #url = (action) => `https://storage.atfunctions.com/api/storage/${action}?IAMKEY=${tokenService.getToken()}`;
}

export default new StoragePixelService();
