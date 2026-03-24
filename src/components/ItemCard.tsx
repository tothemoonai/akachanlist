import React from 'react';
import { Item } from '../types';
import { getPriorityLabel, getPriorityColor } from '../utils/data';
import { ListItemSelector } from './user/ListItemSelector';
import { ItemIcon } from './ItemIcon';
import { ItemNotes } from './user/ItemNotes';

interface ItemCardProps {
  item: Item;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  // 检查是否有用户清单项信息
  const userListItem = (item as any).userListItem;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
      <div className="flex items-start gap-3 mb-2">
        {/* 图标 */}
        <div className="flex-shrink-0 mt-1">
          <ItemIcon icon={(item as any).icon} className="w-8 h-8 text-pink-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-800 flex-1">
              {item.name}
            </h3>
            <span
              className={`${getPriorityColor(
                item.priority
              )} text-white text-xs px-2 py-1 rounded-full flex-shrink-0`}
            >
              {getPriorityLabel(item.priority)}
            </span>
          </div>

          {item.description && (
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          )}

          {item.quantity && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <span className="font-medium">数量：</span>
              <span>{item.quantity}</span>
            </div>
          )}

          {item.notes && (
            <p className="text-xs text-gray-400 mt-2 italic">{item.notes}</p>
          )}
        </div>
      </div>

      {/* 用户备注 - 仅在已添加到清单时显示 */}
      {userListItem && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <ItemNotes
            listItemId={userListItem.id}
            notes={userListItem.user_notes}
            size="small"
          />
        </div>
      )}

      {/* ListItemSelector when item has ID */}
      {item.id && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <ListItemSelector item={item} itemId={item.id} />
        </div>
      )}
    </div>
  );
};
