import { ItemsData } from '../types';

export async function loadItemsData(): Promise<ItemsData> {
  const response = await fetch('/data/items.json');
  if (!response.ok) {
    throw new Error('Failed to load items data');
  }
  return response.json();
}

export function getPriorityLabel(priority: string): string {
  return priority === 'required' ? '必需' : '推荐';
}

export function getPriorityColor(priority: string): string {
  return priority === 'required' ? 'bg-blue-500' : 'bg-green-500';
}
