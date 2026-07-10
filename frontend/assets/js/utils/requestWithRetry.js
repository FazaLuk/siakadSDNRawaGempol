const RETRY_DELAY_MS = 2000;
const MAX_ATTEMPTS = 3;

function getErrorMessage(error) {
  return String(error?.message || error?.error || "").toLowerCase();
}

function getErrorStatus(error) {
  return Number(error?.status || error?.statusCode || error?.response?.status || 0);
}

function isTemporaryNetworkFailure(error) {
  if (!error) return false;

  if (error.name === "AbortError") return true;

  const status = getErrorStatus(error);
  if ([408, 425, 429, 500, 502, 503, 504].includes(status)) return true;

  const message = getErrorMessage(error);

  return (
    message.includes("failed to fetch") ||
    message.includes("fetch failed") ||
    message.includes("networkerror") ||
    message.includes("network error") ||
    message.includes("load failed") ||
    message.includes("request timeout") ||
    message.includes("timeout") ||
    message.includes("socket hang up") ||
    message.includes("temporarily unavailable") ||
    message.includes("service unavailable") ||
    message.includes("gateway timeout")
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function requestWithRetry(asyncOperation) {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await asyncOperation();
    } catch (error) {
      lastError = error;

      if (attempt >= MAX_ATTEMPTS || !isTemporaryNetworkFailure(error)) {
        throw error;
      }

      await delay(RETRY_DELAY_MS);
    }
  }

  throw lastError;
}
