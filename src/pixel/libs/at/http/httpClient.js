const axiosInstance = axios.create({
  baseURL: "https://controlatpx.atfunctions.com/api/controlatpx",
});

class HttpProgressEventImpl {
  get percent() {
    let percent;
    if (typeof this.loaded === "number" && typeof this.total === "number") {
      percent = (this.loaded / this.total) * 100;
    }

    return percent;
  }

  constructor(event) {
    this.response = event?.response;
    this.loaded = event?.loaded;
    this.total = event?.total;
    this.type = event?.type;
  }
}

/**
 * @typedef RequestConfig
 * @property {any} params
 * @property {boolean} observeProgress
 * @property {boolean} observeUploadProgress
 * @property {boolean} observeDownloadProgress
 */
class HttpClient {
  /**
   * @param {string} url
   * @param {RequestConfig} config
   */
  get(url, config) {
    return this._createRequestInternalObservable("get", url, null, config);
  }

  /**
   * @param {string} url
   * @param {any} data
   * @param {RequestConfig} config
   */
  post(url, data, config) {
    return this._createRequestInternalObservable("post", url, data, config);
  }

  /**
   * @param {string} url
   * @param {any} data
   * @param {RequestConfig} config
   */
  put(url, data, config) {
    return this._createRequestInternalObservable("put", url, data, config);
  }

  /**
   * @param {string} url
   * @param {RequestConfig} config
   */
  delete(url, config) {
    return this._createRequestInternalObservable("delete", url, null, config);
  }

  /**
   * @private
   * @param {string} method
   * @param {any} data
   * @param {RequestConfig} config
   *
   * @returns {rxjs.Observable}
   */
  _createRequestInternalObservable(method, url, data, config) {
    return this._createRequestInternalObservableByFactory((axiosConfig) => {
      return axiosInstance.request(
        Object.assign(axiosConfig, { method, url, data })
      );
    }, config);
  }

  /**
   * @private
   * @param {((axiosConfig) => Promise)} factoryRequest
   * @param {RequestConfig} config
   */
  _createRequestInternalObservableByFactory(factoryRequest, config) {
    return new rxjs.Observable((subscriber) => {
      const source = axios.CancelToken.source();

      subscriber.add(() => {
        source.cancel();
      });

      let requestConfig;
      if (config?.haveMultipartForm) {
        requestConfig = {
          params: config?.params,
          cancelToken: source.token,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      } else {
        requestConfig = {
          params: config?.params,
          cancelToken: source.token,
        };
      }

      let observer;
      if (
        config?.observeProgress ||
        config?.observeUploadProgress ||
        config?.observeDownloadProgress
      ) {
        const subjectInternal = new rxjs.Subject();
        const requestSubscription = subjectInternal.subscribe({
          next: (response) => {
            const event = new HttpProgressEventImpl({
              response,
            });
            subscriber.next(event);
          },
          error: (response) => {
            subscriber.error(response);
          },
          complete: () => {
            subscriber.complete();
          },
        });

        if (config?.observeProgress || config?.observeDownloadProgress) {
          requestConfig.onDownloadProgress = (progressEvent) => {
            const event = new HttpProgressEventImpl({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              type: "download",
            });
            subscriber.next(event);
          };
        }

        if (config?.observeProgress || config?.observeUploadProgress) {
          requestConfig.onUploadProgress = (progressEvent) => {
            const event = new HttpProgressEventImpl({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              type: "upload",
            });
            subscriber.next(event);
          };
        }

        subscriber.add(requestSubscription);

        observer = subjectInternal;
      } else {
        observer = subscriber;
      }

      this._handleRequestPromise(observer, factoryRequest(requestConfig));
    }).pipe(
      rxjs.operators.subscribeOn(rxjs.asapScheduler),
      rxjs.operators.observeOn(rxjs.asapScheduler),
      rxjs.operators.catchError((err) => rxjs.throwError(err.response))
    );
  }

  /**
   * @private
   * @param {rxjs.Subscriber} subscriber
   * @param {Promise} requestPromise
   */
  _handleRequestPromise(subscriber, requestPromise) {
    requestPromise
      .then((response) => {
        if (
          !response.data ||
          response.data.HasErrors == true ||
          response.data.hasErrors == true
        )
          throw response;

        subscriber.next(response);
        subscriber.complete();
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          subscriber.complete();
        } else {
          subscriber.error(error);
        }
      });
  }
}

export default new HttpClient();
