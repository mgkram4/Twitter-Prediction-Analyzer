import type { NextPage } from 'next';
import Head from 'next/head';
import PredictionAnalyzer from './components/PredionAnalyzer';


const Home: NextPage = () => {
  return (
    <div className="min-h-full flex flex-col ">
      <Head>
        <title>Twitter Prediction Analyzer</title>
        <meta name="description" content="Analyze Twitter user predictions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-grow container mx-auto px-4 py-8">
        <PredictionAnalyzer />
      </main>

      <footer className="py-4 text-center">
        <a
          href="https://github.com/yourusername/twitter-prediction-analyzer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition duration-200"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
};

export default Home;