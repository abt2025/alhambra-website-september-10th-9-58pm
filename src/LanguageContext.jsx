import React, { createContext, useContext, useState, useEffect } from 'react';
import { multiLanguageContent, blogContent, marketInsightsContent } from './multiLanguageContent.js';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  // Get content based on current language
  const getContent = () => {
    return {
      t: multiLanguageContent[language] || multiLanguageContent['en'],
      blogData: blogContent[language] || blogContent['en'],
      marketData: marketInsightsContent[language] || marketInsightsContent['en']
    };
  };

  const changeLanguage = (newLanguage) => {
    console.log('Changing language from', language, 'to', newLanguage);
    setLanguage(newLanguage);
  };

  useEffect(() => {
    console.log('Language changed to:', language);
    console.log('Content available:', multiLanguageContent[language] ? 'Yes' : 'No');
  }, [language]);

  const value = {
    language,
    changeLanguage,
    ...getContent()
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
