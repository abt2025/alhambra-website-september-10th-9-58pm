import React, { useState, useEffect } from 'react';

const NewsScroller = () => {
  const [newsItems] = useState([
    "Federal Reserve maintains interest rates at 5.25-5.50% amid inflation concerns",
    "Global markets rally as tech earnings exceed expectations for Q3 2025",
    "Cayman Islands maintains AAA credit rating, reinforcing position as premier financial hub",
    "Cryptocurrency adoption accelerates among institutional investors worldwide",
    "European Central Bank signals potential rate cuts in upcoming monetary policy meeting",
    "Asian markets surge following positive manufacturing data from China",
    "Oil prices stabilize as OPEC+ extends production cuts through 2025",
    "Gold reaches new highs amid geopolitical tensions and currency volatility",
    "Banking sector shows resilience with strong quarterly earnings across major institutions",
    "Emerging markets attract record capital inflows as investors seek diversification"
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [newsItems.length]);

  return (
    <div className="bg-gray-50 border-b border-gray-200 py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center">
          <div className="flex items-center space-x-3 mr-6">
            <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold">
              BREAKING
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-semibold text-sm">ECONOMIC NEWS</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <div 
              className="whitespace-nowrap transition-transform duration-1000 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * 100}%)`,
                width: `${newsItems.length * 100}%`
              }}
            >
              {newsItems.map((news, index) => (
                <span 
                  key={index}
                  className="inline-block w-full text-gray-700 text-sm font-medium px-4"
                  style={{ width: `${100 / newsItems.length}%` }}
                >
                  📈 {news}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <span className="text-xs text-gray-500">
              {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'America/Cayman'
              })} KYT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsScroller;
