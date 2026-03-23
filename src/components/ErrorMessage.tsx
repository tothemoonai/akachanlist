import React from 'react';

export const ErrorMessage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          加载数据时出错
        </h2>
        <p className="text-gray-600 mb-4">
          请检查您的网络连接或稍后重试
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          重新加载
        </button>
      </div>
    </div>
  );
};
