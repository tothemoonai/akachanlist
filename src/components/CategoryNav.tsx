import React from 'react';
import { Category } from '../types';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  onCategoryClick,
}) => {
  return (
    <nav className="sticky top-[88px] z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          {categories.map((category) => {
            const IconComponent = Icons[category.icon as keyof typeof Icons] as LucideIcon | undefined;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-50 hover:bg-pink-100 rounded-full text-gray-700 hover:text-gray-900 transition-colors flex-shrink-0"
              >
                {IconComponent && typeof IconComponent === 'function' && (
                  <IconComponent className="w-4 h-4" />
                )}
                <span className="text-sm font-medium whitespace-nowrap">
                  {category.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
