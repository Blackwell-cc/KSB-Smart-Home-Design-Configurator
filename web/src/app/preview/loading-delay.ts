export const MINIMUM_PREVIEW_LOADING_MS = 3_600;

export function remainingPreviewLoadingDelay(
  startedAt: number,
  currentAt: number,
  minimumDuration = MINIMUM_PREVIEW_LOADING_MS,
) {
  return Math.max(0, minimumDuration - (currentAt - startedAt));
}

export function waitForMinimumPreviewLoading(startedAt: number, signal: AbortSignal) {
  const remaining = remainingPreviewLoadingDelay(startedAt, performance.now());
  if (remaining === 0 || signal.aborted) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = setTimeout(finish, remaining);
    signal.addEventListener("abort", finish, { once: true });
  });
}
