export type Priority = 'required' | 'recommended';

export interface Item {
  name: string;
  priority: Priority;
  description?: string;
  quantity?: string;
  notes?: string;
}

export interface Subcategory {
  id: string;
  title: string;
  description?: string;
  items: Item[];
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface ItemsData {
  meta: {
    title: string;
    subtitle: string;
    lastUpdated: string;
  };
  categories: Category[];
}
