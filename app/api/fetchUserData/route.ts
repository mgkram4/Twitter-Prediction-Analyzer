import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';
import fetch, { RequestInit, Response } from 'node-fetch';
import limiter from '../../utils/rateLimiter';

interface TwitterUser {
  id: string;
  name: string;
  username: string;
}

interface TwitterTweet {
  id: string;
  text: string;
}

interface TwitterUserResponse {
  data: TwitterUser;
}

interface TwitterTweetsResponse {
  data: TwitterTweet[];
}

interface QueueItem<T> {
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
  func: () => Promise<T>;
}

type CachedData = {
  user: TwitterUser;
  tweets: TwitterTweet[];
};

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes
const requestQueue: QueueItem<unknown>[] = [];

const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

async function processQueue(): Promise<void> {
  if (requestQueue.length === 0) return;

  const { resolve, reject, func } = requestQueue.shift()!;

  try {
    const result = await func();
    resolve(result);
  } catch (error) {
    reject(error instanceof Error ? error : new Error(String(error)));
  }

  if (requestQueue.length > 0) {
    await wait(5000); // Wait 5 seconds before processing next request
    processQueue();
  }
}

async function queueRequest<T>(func: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    requestQueue.push({ resolve, reject, func } as QueueItem<unknown>);
    if (requestQueue.length === 1) {
      processQueue();
    }
  });
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 5, backoff = 10000): Promise<Response> {
  const remainingTokens = await limiter.removeTokens(1);
  console.log(`Remaining tokens: ${remainingTokens}`);
  if (remainingTokens < 0) {
    console.log(`Rate limit exceeded. Waiting ${-remainingTokens * 5} seconds.`);
    await wait(-remainingTokens * 5000);
  }

  try {
    console.log(`Fetching URL: ${url}`);
    const response = await fetch(url, options);
    console.log(`Response status: ${response.status}`);
    
    if (response.status === 429 && retries > 0) {
      console.log(`Rate limited. Retrying in ${backoff}ms. Retries left: ${retries}`);
      await wait(backoff);
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    return response;
  } catch (error) {
    console.error(`Fetch error:`, error);
    if (retries > 0) {
      console.log(`Error occurred. Retrying in ${backoff}ms. Retries left: ${retries}`);
      await wait(backoff);
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const cachedData = cache.get<CachedData>(username);
  if (cachedData) {
    console.log('Returning cached data for:', username);
    return NextResponse.json(cachedData);
  }

  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    return NextResponse.json({ error: 'Twitter API credentials are not configured' }, { status: 500 });
  }

  console.log('Fetching data for username:', username);

  try {
    const result = await queueRequest<CachedData>(async () => {
      const userUrl = `https://api.twitter.com/2/users/by/username/${username}`;
      const userResponse = await fetchWithRetry(userUrl, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'User-Agent': 'YourAppName/1.0'
        }
      });

      if (!userResponse.ok) {
        const errorBody = await userResponse.text();
        console.error(`Twitter API error (user): ${userResponse.status} ${errorBody}`);
        throw new Error(`Failed to fetch user data: ${errorBody}`);
      }

      const userData: TwitterUserResponse = await userResponse.json();
      console.log('User data:', userData);

      const tweetsUrl = `https://api.twitter.com/2/users/${userData.data.id}/tweets?max_results=10&tweet.fields=text`;
      const tweetsResponse = await fetchWithRetry(tweetsUrl, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'User-Agent': 'YourAppName/1.0'
        }
      });

      if (!tweetsResponse.ok) {
        const errorBody = await tweetsResponse.text();
        console.error(`Twitter API error (tweets): ${tweetsResponse.status} ${errorBody}`);
        throw new Error(`Failed to fetch tweets: ${errorBody}`);
      }

      const tweetsData: TwitterTweetsResponse = await tweetsResponse.json();
      console.log('Tweets data:', tweetsData);

      return {
        user: userData.data,
        tweets: tweetsData.data
      };
    });

    cache.set(username, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      details: 'Please try again later.'
    }, { status: 429 });
  }
}