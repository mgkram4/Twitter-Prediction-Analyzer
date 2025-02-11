# Twitter Prediction Analyzer

## Overview
A Next.js application that analyzes predictions made by Twitter users. The application provides a clean, minimalist interface for analyzing and tracking the accuracy of predictions made on Twitter.

## Features
- Prediction analysis interface
- Responsive design
- GitHub repository integration
- SEO optimization with Next.js Head component

## Technical Stack
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Layout**: Flexbox-based responsive design
- **TypeScript**: Strict type checking with NextPage type implementation

## Project Structure

### Main Components
1. **Home Page (`pages/index.tsx`)**
   - Main entry point of the application
   - Implements NextPage type for TypeScript support
   - Contains the core layout structure

2. **PredictionAnalyzer Component**
   - Core functionality component
   - Located in `components/PredictionAnalyzer`
   - Handles the main prediction analysis logic

### Layout Structure
```jsx
<div className="min-h-full flex flex-col">
  <Head> // SEO and document metadata
  <main>  // Main content area
  <footer> // Application footer with GitHub link
</div>
```

### SEO Configuration
The application includes basic SEO setup using Next.js Head component:
```jsx
<Head>
  <title>Twitter Prediction Analyzer</title>
  <meta name="description" content="Analyze Twitter user predictions" />
  <link rel="icon" href="/favicon.ico" />
</Head>
```

## Styling
- Uses Tailwind CSS for utility-first styling
- Responsive design with container class
- Flex layout for full-height page structure
- Custom hover effects on footer links

### Key CSS Classes
- `min-h-full`: Ensures minimum full height
- `flex-col`: Vertical flex layout
- `container`: Centered content container
- `mx-auto`: Horizontal auto margins
- `flex-grow`: Flexible growth for main content
- Custom hover transitions on interactive elements

## Development Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## Component Usage
```typescript
import type { NextPage } from 'next';
import PredictionAnalyzer from './components/PredictionAnalyzer';

const Home: NextPage = () => {
  // Component implementation
};
```

## Customization
The application can be customized by:
1. Modifying the PredictionAnalyzer component
2. Updating the layout structure
3. Customizing Tailwind CSS classes
4. Adding additional meta tags for SEO

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Repository
The source code is available on GitHub at:
`https://github.com/yourusername/twitter-prediction-analyzer`

## License
This project is open source. For complete details, see the LICENSE file in the repository.
