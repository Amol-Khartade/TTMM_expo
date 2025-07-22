export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  retryCondition?: (error: any) => boolean;
}

export const defaultRetryOptions: RetryOptions = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 'exponential',
  retryCondition: (error: any) => {
    // Retry on network errors, temporary unavailability, but not on auth failures
    if (error.code) {
      return [
        'auth/network-request-failed',
        'auth/too-many-requests',
        'unavailable',
        'resource-exhausted',
        'deadline-exceeded'
      ].includes(error.code);
    }
    return false;
  }
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxAttempts = defaultRetryOptions.maxAttempts!,
    delay = defaultRetryOptions.delay!,
    backoff = defaultRetryOptions.backoff!,
    retryCondition = defaultRetryOptions.retryCondition!
  } = options;

  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt or if retry condition is not met
      if (attempt === maxAttempts || !retryCondition(error)) {
        throw error;
      }
      
      // Calculate delay for next attempt
      const nextDelay = backoff === 'exponential' 
        ? delay * Math.pow(2, attempt - 1) 
        : delay * attempt;
      
      console.log(`Attempt ${attempt} failed, retrying in ${nextDelay}ms...`, error.message);
      await sleep(nextDelay);
    }
  }
  
  throw lastError;
};