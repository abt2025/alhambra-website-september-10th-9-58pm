import React, { useState, useEffect, createContext, useContext } from 'react';
import { multiLanguageContent } from './multiLanguageContent.js';

// Create Language Context
const LanguageContext = createContext();

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force component re-render when language changes
  const changeLanguage = (newLanguage) => {
    console.log('Changing language from', currentLanguage, 'to', newLanguage);
    setCurrentLanguage(newLanguage);
    setForceUpdate(prev => prev + 1); // Force re-render
    
    // Also trigger a DOM update
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: newLanguage } 
      }));
    }, 100);
  };

  // Get current language content
  const getCurrentContent = () => {
    const content = multiLanguageContent[currentLanguage] || multiLanguageContent.en;
    console.log('Getting content for language:', currentLanguage, content);
    return content;
  };

  const value = {
    language: currentLanguage,
    content: getCurrentContent(),
    changeLanguage,
    forceUpdate
  };

  return (
    <LanguageContext.Provider value={value}>
      <div key={`lang-${currentLanguage}-${forceUpdate}`}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguageManager = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageManager must be used within a LanguageProvider');
  }
  return context;
};

// Language Selector Component
export const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguageManager();
  
  const languages = [
    { code: 'en', name: '🇺🇸 English', flag: '🇺🇸' },
    { code: 'es', name: '🇪🇸 Español', flag: '🇪🇸' },
    { code: 'ar', name: '🇸🇦 العربية', flag: '🇸🇦' },
    { code: 'zh', name: '🇨🇳 中文', flag: '🇨🇳' }
  ];

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    console.log('Language selector changed to:', newLanguage);
    changeLanguage(newLanguage);
  };

  return (
    <div className="language-selector">
      <select 
        value={language} 
        onChange={handleLanguageChange}
        className="bg-red-600 text-white px-3 py-1 rounded border-none outline-none cursor-pointer"
        style={{ minWidth: '120px' }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// Higher Order Component to wrap components that need language updates
export const withLanguage = (WrappedComponent) => {
  return function LanguageWrappedComponent(props) {
    const { language, content, forceUpdate } = useLanguageManager();
    
    return (
      <div key={`${language}-${forceUpdate}`}>
        <WrappedComponent 
          {...props} 
          language={language} 
          content={content} 
          t={content}
        />
      </div>
    );
  };
};
