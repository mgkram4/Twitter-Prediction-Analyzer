import { TokenBucket } from 'limiter';

// Create a token bucket that refills at 1 token per second, with a maximum of 10 tokens
const limiter = new TokenBucket({
  bucketSize: 10,
  tokensPerInterval: 1,
  interval: 1000 // 1 second
});

export async function rateLimiter(): Promise<boolean> {
  // Try to remove a token from the bucket
  const hasToken = await limiter.removeTokens(1);
  
  // If we successfully removed a token, the request is not rate limited
  return !hasToken;
}

export default limiter;