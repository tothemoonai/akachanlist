import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleToggle = () => {
    setLanguage(language === 'zh' ? 'ja' : 'zh');
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-pink-100
                 rounded-full shadow-sm transition-colors duration-200"
      aria-label="Switch language"
    >
      <Languages className="w-4 h-4 text-pink-500" />
      <span className="text-sm font-medium text-gray-700">
        {language === 'zh' ? '中文' : '日本語'}
      </span>
    </button>
  );
};
