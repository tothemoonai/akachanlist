import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const ErrorMessage: React.FC = () => {
  const { language } = useLanguage();

  const text = {
    zh: {
      title: '加载数据时出错',
      description: '请检查您的网络连接或稍后重试',
      button: '重新加载'
    },
    ja: {
      title: 'データの読み込みエラー',
      description: 'ネットワーク接続を確認するか、後でもう一度お試しください',
      button: '再読み込み'
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8" role="alert" aria-live="assertive">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {text[language].title}
        </h2>
        <p className="text-gray-600 mb-4">
          {text[language].description}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          {text[language].button}
        </button>
      </div>
    </div>
  );
};
