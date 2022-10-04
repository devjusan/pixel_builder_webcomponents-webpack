const loadingPromiseMap = new Map();

export function loadRequirement(url, metaUrl) {
  url = new URL(url, metaUrl).href;

  let promise;

  if (loadingPromiseMap.has(url)) {
    promise = loadingPromiseMap.get(url);
  } else {
    promise = fetch(url).then((res) => res.text());
    loadingPromiseMap.set(url, promise);
  }

  return promise;
}

export function loadRequirements(urls, metaUrl) {
  return Promise.all(
    urls.map((url) => {
      return loadRequirement(url, metaUrl);
    })
  );
}
