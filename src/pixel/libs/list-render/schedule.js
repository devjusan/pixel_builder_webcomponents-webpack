const promiseResolved = Promise.resolve();

export function scheduleAsync(fn, signal) {
  return promiseResolved.then(() => {
    if (signal?.aborted) {
      return;
    }

    return fn();
  });
}

export function scheduleAnimationFrameAsync(fn, signal) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      if (signal?.aborted) {
        resolve();
        return;
      }

      resolve(fn());
    });
  });
}

export function scheduleDelayAsync(fn, delay, signal) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (signal?.aborted) {
        resolve();
        return;
      }

      resolve(fn());
    }, delay ?? 0);
  });
}
