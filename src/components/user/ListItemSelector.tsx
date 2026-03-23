import { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { useUserList } from '../../contexts/UserListContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Item } from '../../types';
import { validateQuantity } from '../../utils/validation';
import { ConfirmDialog } from './ConfirmDialog';

interface ListItemSelectorProps {
  item: Item;
  itemId: string; // UUID from Supabase items table
}

export function ListItemSelector({ item, itemId }: ListItemSelectorProps) {
  const { user, currentList, listItems, addItem, removeItem, updateItem } = useUserList();
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [priority, setPriority] = useState<'required' | 'recommended' | 'optional'>('recommended');
  const [quantity, setQuantity] = useState(1);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  // Check if item is in current list
  const listItem = listItems.find(li => li.item_id === itemId);

  if (!user) {
    return null; // Don't show for non-authenticated users
  }

  if (!currentList) {
    return (
      <button
        className="text-sm text-pink-500 hover:text-pink-600 font-medium"
        disabled
      >
        {language === 'zh' ? '请先选择或创建清单' : '先にリストを選択または作成してください'}
      </button>
    );
  }

  const handleAdd = async () => {
    try {
      await addItem(currentList.id, itemId, priority, quantity);
      setExpanded(false);
      setPriority('recommended');
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleUpdate = async () => {
    if (!listItem) return;

    try {
      await updateItem(listItem.id, priority, quantity);
      setExpanded(false);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!listItem) return;

    try {
      await removeItem(listItem.id);
      setItemToRemove(null);
      setExpanded(false);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value, 10);
    if (validateQuantity(num)) {
      setQuantity(num);
    }
  };

  if (listItem && !expanded) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {language === 'zh' ? '已添加' : '追加済み'} ({listItem.quantity})
        </span>
        <button
          onClick={() => setExpanded(true)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (listItem && expanded) {
    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
        <div className="space-y-3">
          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {language === 'zh' ? '优先级' : '優先度'}
            </label>
            <div className="flex gap-2">
              {(['required', 'recommended', 'optional'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`
                    px-3 py-1 text-xs font-medium rounded transition-colors
                    ${priority === p
                      ? 'bg-pink-500 text-white'
                      : 'bg-white text-gray-700 border hover:bg-gray-50'
                    }
                  `}
                >
                  {language === 'zh'
                    ? (p === 'required' ? '必需' : p === 'recommended' ? '推荐' : '可选')
                    : (p === 'required' ? '必須' : p === 'recommended' ? '推奨' : '任意')
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {language === 'zh' ? '数量' : '数量'}
            </label>
            <input
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded transition-colors"
            >
              {language === 'zh' ? '更新' : '更新'}
            </button>
            <button
              onClick={() => setItemToRemove(listItem.id)}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <ConfirmDialog
          isOpen={!!itemToRemove}
          title={language === 'zh' ? '移除物品' : 'アイテムを削除'}
          message={
            language === 'zh'
              ? '确定要从清单中移除这个物品吗？'
              : 'このアイテムをリストから削除してもよろしいですか？'
          }
          onConfirm={handleRemoveConfirm}
          onCancel={() => setItemToRemove(null)}
        />
      </div>
    );
  }

  // Not in list, show add button or expanded add form
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        {language === 'zh' ? '添加到清单' : 'リストに追加'}
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
      <div className="space-y-3">
        {/* Priority */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {language === 'zh' ? '优先级' : '優先度'}
          </label>
          <div className="flex gap-2">
            {(['required', 'recommended', 'optional'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`
                  px-3 py-1 text-xs font-medium rounded transition-colors
                  ${priority === p
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-700 border hover:bg-gray-50'
                  }
                `}
              >
                {language === 'zh'
                  ? (p === 'required' ? '必需' : p === 'recommended' ? '推荐' : '可选')
                  : (p === 'required' ? '必須' : p === 'recommended' ? '推奨' : '任意')
                }
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {language === 'zh' ? '数量' : '数量'}
          </label>
          <input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded transition-colors"
          >
            {language === 'zh' ? '添加' : '追加'}
          </button>
          <button
            onClick={() => {
              setExpanded(false);
              setPriority('recommended');
              setQuantity(1);
            }}
            className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            {language === 'zh' ? '取消' : 'キャンセル'}
          </button>
        </div>
      </div>
    </div>
  );
}
