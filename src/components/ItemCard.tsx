import React from 'react';
import { Item } from '../types';
import { getPriorityLabel, getPriorityColor } from '../utils/data';

interface ItemCardProps {
  item: Item;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800 flex-1">
          {item.name}
        </h3>
        <span
          className={`${getPriorityColor(
            item.priority
          )} text-white text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0`}
        >
          {getPriorityLabel(item.priority)}
        </span>
      </div>

      {item.description && (
        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
      )}

      {item.quantity && (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <span className="font-medium">数量：</span>
          <span>{item.quantity}</span>
        </div>
      )}

      {item.notes && (
        <p className="text-xs text-gray-400 mt-2 italic">{item.notes}</p>
      )}
    </div>
  );
};
