"use client"

import React, { useState } from 'react';
import { ApiError, PredictionAnalysis, Tweet, User } from '../types';
import ErrorPopup from './ErrorPopup';

const PredictionAnalyzer: React.FC = () => {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState<User | null>(null);
  const [, setTweets] = useState<Tweet[]>([]);
  const [analysis, setAnalysis] = useState<PredictionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchUserData = async () => {
    setLoading(true);
    setError('');
    setUserData(null);
    setTweets([]);
    setAnalysis(null);

    try {
      const response = await fetch(`/api/fetchUserData?username=${encodeURIComponent(username)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }
      const data = await response.json();
      setUserData(data.user);
      setTweets(data.tweets);
      await handleAnalyzePredictions(data.user, data.tweets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePredictions = async (user: User, userTweets: Tweet[]) => {
    if (!user || userTweets.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyzePredictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userData: user, tweets: userTweets }),
      });
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        throw new Error(`Failed to analyze predictions: ${response.statusText}`);
      }
      const data: PredictionAnalysis | ApiError = await response.json();
      if ('error' in data) {
        throw new Error(data.error);
      }
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-300 min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">Quant Predictor Analyzer</h1>
      
      <div className="mb-4 flex">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter Twitter username"
          className="flex-grow p-2 bg-white border border-gray-400 rounded-l text-black placeholder-gray-500 focus:outline-none focus:border-gray-600"
        />
        <button
          onClick={handleFetchUserData}
          disabled={loading || !username.trim()}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-r disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      
      {userData && analysis && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gray-400 rounded-full mr-4"></div>
            <div>
              <h2 className="text-2xl font-bold">{userData.name}</h2>
              <p className="text-gray-600">@{userData.username}</p>
            </div>
          </div>
          
          <p className="text-xl mb-4 font-semibold">{analysis.summary}</p>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Prediction Rating</h3>
            <p className="text-gray-700">{analysis.rating}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Top Topics</h3>
            <ol className="list-decimal list-inside">
              {analysis.topTopics.map((topic, index) => (
                <li key={index} className="mb-1">{topic}</li>
              ))}
            </ol>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Catch Phrases</h3>
            <ul className="list-disc list-inside">
              {analysis.catchPhrases.map((phrase, index) => (
                <li key={index} className="mb-1">{phrase}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Next Prediction</h3>
            <p className="text-gray-700">{analysis.nextPick}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Best Predictions</h3>
              <ol className="list-decimal list-inside">
                {analysis.bestPredictions.map((prediction, index) => (
                  <li key={index} className="mb-1">{prediction}</li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Worst Predictions</h3>
              <ol className="list-decimal list-inside">
                {analysis.worstPredictions.map((prediction, index) => (
                  <li key={index} className="mb-1">{prediction}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
      
      {error && <ErrorPopup message={error} onClose={() => setError('')} />}
    </div>
  );
};

export default PredictionAnalyzer;