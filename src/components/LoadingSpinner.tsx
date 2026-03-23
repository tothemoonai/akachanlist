import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LoadingSpinner: React.FC = () => {
  const { language } = useLanguage();

  const text = {
    zh: '加载中...',
    ja: '読み込み中...'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">{text[language]}</p>
      </div>
    </div>
  );
};
