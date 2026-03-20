import React from 'react';

interface FooterProps {
  source: string;
  disclaimer: string;
}

export const Footer: React.FC<FooterProps> = ({ source, disclaimer }) => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>
            数据来源：{' '}
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-600 underline"
            >
              日本赤ちゃん本舗
            </a>
          </p>
          <p className="text-xs text-gray-500">{disclaimer}</p>
        </div>
      </div>
    </footer>
  );
};
