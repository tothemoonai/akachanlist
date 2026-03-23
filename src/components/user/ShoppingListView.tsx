import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, ShoppingCart, Check, RotateCcw } from 'lucide-react';
import { useUserList } from '../../contexts/UserListContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { SupabaseUserListItem, ShoppingListGroup } from '../../types';

interface ShoppingListViewProps {
  isOpen: boolean;
  onClose: () => void;
}

// Type for joined data from Supabase query
interface UserListItemWithRelations extends SupabaseUserListItem {
  user_lists: {
    id: string;
    name: string;
  };
  item: {
    id: string;
    name_zh: string;
    name_ja: string;
  } | null;
}

const STALE_TIME = 2 * 60 * 1000; // 2 minutes

// Helper function to group items by list
function groupItemsByList(items: UserListItemWithRelations[]): Record<string, ShoppingListGroup> {
  return items.reduce((acc, item) => {
    const listId = item.user_list_id;
    if (!acc[listId]) {
      acc[listId] = {
        list_id: listId,
        list_name: item.user_lists.name,
        items: [],
      };
    }
    acc[listId].items.push(item);
    return acc;
  }, {} as Record<string, ShoppingListGroup>);
}

export function ShoppingListView({ isOpen, onClose }: ShoppingListViewProps) {
  const { user, togglePurchased, resetPurchasedItem } = useUserList();
  const { language } = useLanguage();

  // Fetch all list items across all lists
  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ['shoppingList', user?.id],
    queryFn: async () => {
      if (!user || !supabase) return [];

      const { data, error } = await supabase
        .from('user_list_items')
        .select('*, user_lists!inner(id, name), items(id, name_zh, name_ja)')
        .eq('user_lists.user_id', user.id)
        .order('user_list_items.created_at', { ascending: true });

      if (error) throw error;
      return data as UserListItemWithRelations[];
    },
    enabled: isOpen && !!user,
    staleTime: STALE_TIME,
  });

  // Group items by list and separate purchased/unpurchased
  const unpurchasedGroups = useMemo(
    () => groupItemsByList(allItems.filter(item => !item.is_purchased)),
    [allItems]
  );

  const purchasedGroups = useMemo(
    () => groupItemsByList(allItems.filter(item => item.is_purchased)),
    [allItems]
  );

  const unpurchasedCount = useMemo(() =>
    Object.values(unpurchasedGroups).reduce(
      (sum, group) => sum + group.items.length,
      0
    ),
    [unpurchasedGroups]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-4 md:bottom-4 md:right-4 md:left-auto md:w-[600px] bg-white rounded-lg shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-bold text-gray-900">
              {language === 'zh' ? '购物清单' : 'ショッピングリスト'}
            </h2>
            {unpurchasedCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-pink-100 text-pink-700 rounded-full">
                {unpurchasedCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">
                {language === 'zh' ? '加载中...' : '読み込み中...'}
              </div>
            </div>
          ) : allItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {language === 'zh'
                  ? '购物清单是空的'
                  : 'ショッピングリストは空です'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Unpurchased Items */}
              {Object.values(unpurchasedGroups).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    {language === 'zh' ? '待购买' : '購入予定'} ({unpurchasedCount})
                  </h3>
                  <div className="space-y-4">
                    {Object.values(unpurchasedGroups).map((group) => (
                      <div key={group.list_id}>
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          {group.list_name}
                        </p>
                        <div className="space-y-2">
                          {group.items.map((item: UserListItemWithRelations) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <button
                                onClick={() => togglePurchased(item.id)}
                                className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded hover:border-pink-500 transition-colors"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {language === 'zh'
                                    ? (item.item?.name_zh || '无名称')
                                    : (item.item?.name_ja || '名前なし')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {language === 'zh' ? '数量' : '数量'}: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchased Items */}
              {Object.values(purchasedGroups).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    {language === 'zh' ? '已购买' : '購入済み'}
                  </h3>
                  <div className="space-y-4">
                    {Object.values(purchasedGroups).map((group) => (
                      <div key={group.list_id}>
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          {group.list_name}
                        </p>
                        <div className="space-y-2">
                          {group.items.map((item: UserListItemWithRelations) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2 bg-gray-50 border rounded-lg"
                            >
                              <div className="flex-shrink-0 w-5 h-5 bg-pink-500 rounded flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-through">
                                  {language === 'zh'
                                    ? (item.item?.name_zh || '无名称')
                                    : (item.item?.name_ja || '名前なし')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {language === 'zh' ? '数量' : '数量'}: {item.quantity}
                                </p>
                              </div>
                              <button
                                onClick={() => resetPurchasedItem(item.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title={language === 'zh' ? '重置' : 'リセット'}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
