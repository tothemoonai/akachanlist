import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useUserList } from '../contexts/UserListContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ItemCard } from './ItemCard';

export function AddedItemsView() {
  const { user, listItems, currentList } = useUserList();
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  // Group items by subcategory and category
  const groupedItems = useMemo(() => {
    if (!user || !currentList || listItems.length === 0) {
      return null;
    }

    console.log('📦 AddedItemsView - listItems:', listItems.length);
    console.log('📦 AddedItemsView - currentList:', currentList.name);

    // Get all unique items with their details
    const itemsWithDetails = listItems
      .filter(li => li.item)
      .map(li => {
        const item = li.item;
        console.log('📦 Processing list item:', li.id, 'item:', item);
        // Use the original item's priority, not user_list_items.priority
        const priority: 'required' | 'recommended' = item?.priority || 'recommended';
        return {
          id: item?.id,
          name: item?.name_zh || '',
          priority,
          description: item?.description_zh,
          quantity: li.quantity.toString(),
          notes: undefined,
          userListItem: li
        };
      });

    console.log('✅ Processed items:', itemsWithDetails.length);

    if (itemsWithDetails.length === 0) {
      return null;
    }

    return itemsWithDetails;
  }, [user, currentList, listItems]);

  if (!user || !currentList) {
    return null;
  }

  const itemCount = groupedItems?.length || 0;

  return (
    <div className="mb-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg shadow-md border-2 border-pink-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:from-pink-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
            {itemCount}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900">
              {language === 'zh' ? '我的清单物品' : 'マイリストのアイテム'}
            </h3>
            <p className="text-sm text-gray-600">
              {currentList.name} · {language === 'zh' ? `共 ${itemCount} 件` : `計 ${itemCount}件`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6">
          {groupedItems && groupedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {language === 'zh'
                  ? '还没有添加任何物品到清单'
                  : 'まだアイテムを追加していません'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
