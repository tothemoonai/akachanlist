import React, { useState } from 'react';
import { Subcategory } from '../types';
import { ItemCard } from './ItemCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CategorySectionProps {
  subcategory: Subcategory;
  defaultExpanded?: boolean;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  subcategory,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-pink-50 to-white hover:from-pink-100 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-800">
            {subcategory.title}
          </h3>
          {subcategory.description && (
            <p className="text-sm text-gray-600 mt-1">
              {subcategory.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {subcategory.items.length} 件物品
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subcategory.items.map((item, index) => (
              <ItemCard key={index} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
