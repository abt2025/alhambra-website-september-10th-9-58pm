import React, { useState, useEffect } from 'react';
import { multiLanguageContent } from './multiLanguageContent.js';

// Simple language switching hook
export const useLanguage = () => {
  const [language, setLanguage] = useState('en');
  const [content, setContent] = useState(multiLanguageContent.en);

  useEffect(() => {
    // Force update content when language changes
    setContent(multiLanguageContent[language] || multiLanguageContent.en);
  }, [language]);

  const changeLanguage = (newLanguage) => {
    console.log('Changing language to:', newLanguage);
    setLanguage(newLanguage);
  };

  return { language, content, changeLanguage };
};

// Language selector component
export const LanguageSelector = ({ language, onLanguageChange }) => {
  const languages = [
    { code: 'en', name: '🇺🇸 English' },
    { code: 'es', name: '🇪🇸 Español' },
    { code: 'ar', name: '🇸🇦 العربية' },
    { code: 'zh', name: '🇨🇳 中文' }
  ];

  return (
    <select 
      value={language} 
      onChange={(e) => onLanguageChange(e.target.value)}
      className="bg-red-600 text-white px-3 py-1 rounded border-none outline-none"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};
