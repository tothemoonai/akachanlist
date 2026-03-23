import React from 'react';
import { User, Baby } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="sticky top-0 z-50 bg-pink-50 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        {/* 第一行：标题 + 语言切换器 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-pink-500" />
            <Baby className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {title}
            </h1>
          </div>

          {/* 语言切换器 */}
          <LanguageSwitcher />
        </div>

        {/* 第二行：副标题 */}
        <p className="text-gray-600 text-sm md:text-base pl-11">
          {subtitle}
        </p>
      </div>
    </header>
  );
};
