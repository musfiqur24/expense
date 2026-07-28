export const MINIMUM_SKELETON_DURATION = 1000;

/**
 * Keeps a visible loading skeleton on screen long enough to avoid a distracting flash.
 * Errors use the same minimum duration so their transition is just as stable.
 */
export async function withMinimumLoadingTime(task, minimumMs = MINIMUM_SKELETON_DURATION) {
  const startedAt = Date.now();

  try {
    return await task();
  } finally {
    const remaining = Math.max(0, minimumMs - (Date.now() - startedAt));
    if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}
