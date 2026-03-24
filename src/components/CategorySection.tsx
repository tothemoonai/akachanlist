import React, { useState, useMemo } from 'react';
import { Subcategory } from '../types';
import { ItemCard } from './ItemCard';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useUserList } from '../contexts/UserListContext';
import { useLanguage } from '../contexts/LanguageContext';

interface CategorySectionProps {
  subcategory: Subcategory;
  defaultExpanded?: boolean;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  subcategory,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { listItems, currentList } = useUserList();
  const { language } = useLanguage();

  // Separate items into added and not added
  const { addedItems, notAddedItems, addedCount } = useMemo(() => {
    if (!currentList) {
      return { addedItems: [], notAddedItems: subcategory.items, addedCount: 0 };
    }

    const addedItemIds = new Set(listItems.map(li => li.item_id));

    const added = subcategory.items.filter(item => item.id && addedItemIds.has(item.id));
    const notAdded = subcategory.items.filter(item => !item.id || !addedItemIds.has(item.id));

    return {
      addedItems: added,
      notAddedItems: notAdded,
      addedCount: added.length
    };
  }, [subcategory.items, listItems, currentList]);

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
          {currentList && addedCount > 0 && (
            <p className="text-xs text-pink-600 mt-1 font-medium">
              {language === 'zh' ? `已添加 ${addedCount} / ${subcategory.items.length} 件` : `${addedCount} / ${subcategory.items.length}件追加済み`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {subcategory.items.length} {language === 'zh' ? '件物品' : '件'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Added Items Section */}
          {addedItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px bg-pink-300 flex-1" />
                <span className="text-sm font-medium text-pink-600 px-2">
                  {language === 'zh' ? '✓ 已添加到清单' : '✓ 追加済み'}
                </span>
                <div className="h-px bg-pink-300 flex-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {addedItems.map((item) => (
                  <ItemCard key={item.id || `added-${Math.random()}`} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Not Added Items Section */}
          {notAddedItems.length > 0 && (
            <div>
              {addedItems.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px bg-gray-200 flex-1" />
                  <span className="text-sm font-medium text-gray-400 px-2">
                    {language === 'zh' ? '未添加' : '未追加'}
                  </span>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {notAddedItems.map((item, index) => (
                  <ItemCard key={item.id || `notadded-${index}`} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
