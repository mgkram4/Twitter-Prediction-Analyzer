// types.ts

export interface User {
  id: string;
  name: string;
  username: string;
  description?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

export interface Tweet {
  id: string;
  text: string;
}

export interface PredictionAnalysis {
  highestAccuracy: number;
  topTopics: string[];
  
  rating: string;
  bestPredictions: string[];
  worstPredictions: string[];
  summary: string;
  nextPick: string;
  catchPhrases: string[];
}
export interface FetchUserDataResponse {
  user: User;
  tweets: Tweet[];
}

export interface ApiError {
  error: string;
}

export interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

export interface AnalyzeRequest {
  userData: User;
  tweets: Tweet[];
}