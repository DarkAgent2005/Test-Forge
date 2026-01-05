// Exponential backoff retry logic with configurable options
async function retryWithBackoff(
  fn,
  options = {}
) {
  const {
    maxRetries = 2,
    initialDelayMs = 500,
    maxDelayMs = 5000,
    backoffMultiplier = 1.5,
    shouldRetry = () => true,
  } = options;

  let lastError;
  let delay = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt < maxRetries && shouldRetry(error, attempt)) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelayMs);
      } else {
        throw error;
      }
    }
  }

  throw lastError;
}

module.exports = { retryWithBackoff };
