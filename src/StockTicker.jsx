import React, { useState, useEffect } from 'react';

const StockTicker = () => {
  const [tickerData, setTickerData] = useState([
    { symbol: 'S&P 500', price: '5,751.13', change: '+12.44', changePercent: '+0.22%', isPositive: true },
    { symbol: 'NASDAQ', price: '18,137.85', change: '+51.18', changePercent: '+0.28%', isPositive: true },
    { symbol: 'DOW', price: '42,208.22', change: '+124.75', changePercent: '+0.30%', isPositive: true },
    { symbol: 'USD/EUR', price: '0.9012', change: '-0.0023', changePercent: '-0.25%', isPositive: false },
    { symbol: 'GBP/USD', price: '1.3145', change: '+0.0087', changePercent: '+0.67%', isPositive: true },
    { symbol: 'USD/JPY', price: '143.25', change: '+0.85', changePercent: '+0.60%', isPositive: true },
    { symbol: 'GOLD', price: '$2,658.40', change: '+15.20', changePercent: '+0.58%', isPositive: true },
    { symbol: 'CRUDE OIL', price: '$68.12', change: '-1.23', changePercent: '-1.77%', isPositive: false },
    { symbol: 'BITCOIN', price: '$58,245', change: '+1,234', changePercent: '+2.17%', isPositive: true },
    { symbol: 'ETHEREUM', price: '$2,456', change: '+89', changePercent: '+3.76%', isPositive: true }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tickerData.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [tickerData.length]);

  // Simulate real-time price updates
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setTickerData(prevData => 
        prevData.map(item => {
          const randomChange = (Math.random() - 0.5) * 0.02; // ±1% random change
          const newPrice = parseFloat(item.price.replace(/[$,]/g, '')) * (1 + randomChange);
          const change = newPrice - parseFloat(item.price.replace(/[$,]/g, ''));
          const changePercent = (change / parseFloat(item.price.replace(/[$,]/g, ''))) * 100;
          
          return {
            ...item,
            price: item.symbol.includes('USD') || item.symbol.includes('GBP') || item.symbol.includes('EUR') || item.symbol.includes('JPY') 
              ? newPrice.toFixed(4)
              : item.symbol.includes('$') 
                ? `$${newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change: change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
            changePercent: changePercent > 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
            isPositive: change > 0
          };
        })
      );
    }, 10000); // Update every 10 seconds

    return () => clearInterval(updateInterval);
  }, []);

  const visibleItems = [];
  for (let i = 0; i < 4; i++) {
    const index = (currentIndex + i) % tickerData.length;
    visibleItems.push(tickerData[index]);
  }

  return (
    <div className="bg-white border-b border-gray-200 py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-red-600 font-semibold text-sm mr-4">LIVE MARKETS</span>
            <div className="flex space-x-6 animate-pulse">
              {visibleItems.map((item, index) => (
                <div key={`${item.symbol}-${index}`} className="flex items-center space-x-2 min-w-0">
                  <span className="text-gray-800 font-medium text-sm whitespace-nowrap">
                    {item.symbol}
                  </span>
                  <span className="text-gray-900 font-semibold text-sm">
                    {item.price}
                  </span>
                  <span className={`text-sm font-medium ${
                    item.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.change} ({item.changePercent})
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Real-time data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockTicker;
