import { ApiError, PredictionAnalysis, Tweet, User } from '@/app/types';
import { NextRequest, NextResponse } from 'next/server';
import NodeCache from 'node-cache';
import OpenAI from 'openai';
import { rateLimiter } from '../../utils/rateLimiter';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

function wait(ms: number): Promise<void> {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number = 5): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
      console.log(`Retry ${i + 1}/${maxRetries} after ${waitTime}ms`);
      await wait(waitTime);
    }
  }
  throw new Error('Max retries reached');
}

export async function POST(request: NextRequest): Promise<NextResponse<PredictionAnalysis | ApiError>> {
  const isRateLimited = await rateLimiter();
  
  if (isRateLimited) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again in a moment.' } as ApiError,
      { status: 429 }
    );
  }

  let userData: User;
  let tweets: Tweet[];

  try {
    const body = await request.json();
    userData = body.userData;
    tweets = body.tweets;
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: 'Invalid request body' } as ApiError, { status: 400 });
  }

  if (!userData || !tweets) {
    return NextResponse.json({ error: 'User data and tweets are required' } as ApiError, { status: 400 });
  }

  console.log('Received userData:', JSON.stringify(userData, null, 2));
  console.log('Received tweets:', JSON.stringify(tweets, null, 2));

  const cacheKey = `analysis_${userData.username}`;
  const cachedResult = cache.get<PredictionAnalysis>(cacheKey);
  if (cachedResult) {
    return NextResponse.json(cachedResult);
  }

  try {
    const prompt = `Analyze the Twitter profile of @${userData.username}:
    - Name: ${userData.name || 'Unknown'}
    - Followers: ${userData.public_metrics?.followers_count ?? 'Unknown'}
    - Following: ${userData.public_metrics?.following_count ?? 'Unknown'}
    - Tweet count: ${userData.public_metrics?.tweet_count ?? 'Unknown'}
    - Description: ${userData.description || 'No description available'}

    Recent tweets:
    ${tweets.slice(0, 10).map(function(tweet: Tweet) { return `- ${tweet.text}`; }).join('\n')}

    Based on this information, generate a humorous prediction analysis including:
    1. The highest accuracy prediction they've made (estimate a percentage)
    2. Top 3 topics they like to talk about
    3. A witty rating of their prediction ability (e.g., "Crystal Ball Polisher", "Fortune Cookie Writer")
    4. Top 3 best predictions they might have made (based on the tweets provided)
    5. Top 3 worst predictions they might have made (based on the tweets provided)
    6. A short, humorous summary about the type of predictor they are
    7. A prediction for what they might pick next
    8. Three catch phrases they might use (e.g., "Quant said...", "@username predicted...")

    Provide this information in a structured format, clearly labeling each section.`;

    const completion = await retryWithBackoff(function() {
      return openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [{ role: "user", content: prompt }],
      });
    });

    const result = completion.choices[0].message?.content;

    if (!result) {
      throw new Error('No response from ChatGPT');
    }

    // Parse the generated text to extract the prediction analysis
    const sections = result.split('\n\n');
    const highestAccuracy = parseFloat(sections.find(s => s.includes('highest accuracy'))?.split(':')[1] || '0');
    const topTopics = sections.find(s => s.includes('Top 3 topics'))?.split(':')[1]?.split(',').map(t => t.trim()) || [];
    const rating = sections.find(s => s.includes('rating'))?.split(':')[1]?.trim() || 'Unknown';
    const bestPredictions = sections.find(s => s.includes('Top 3 best predictions'))?.split('\n').slice(1).map(p => p.trim()) || [];
    const worstPredictions = sections.find(s => s.includes('Top 3 worst predictions'))?.split('\n').slice(1).map(p => p.trim()) || [];
    const summary = sections.find(s => s.includes('summary'))?.split(':')[1]?.trim() || '';
    const nextPick = sections.find(s => s.includes('prediction for what they might pick next'))?.split(':')[1]?.trim() || '';
    const catchPhrases = sections.find(s => s.includes('catch phrases'))?.split('\n').slice(1).map(p => p.trim()) || [];

    const analysis: PredictionAnalysis = {
      highestAccuracy,
      topTopics,
      rating,
      bestPredictions,
      worstPredictions,
      summary,
      nextPick,
      catchPhrases
    };

    cache.set(cacheKey, analysis);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing predictions:', error);
    return NextResponse.json({ error: 'Failed to analyze predictions' } as ApiError, { status: 500 });
  }
}