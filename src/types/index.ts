export type Language = 'zh' | 'ja';

// Supabase 原始响应类型
export interface SupabaseProject {
  id: string;
  slug: string;
  name_zh: string;
  name_ja: string;
  description_zh: string;
  description_ja: string;
}

export interface SupabaseItem {
  id: string;
  name_zh: string;
  name_ja: string;
  description_zh?: string;
  description_ja?: string;
  priority: Priority;
  quantity_zh?: string;
  quantity_ja?: string;
  notes_zh?: string;
  notes_ja?: string;
}

export interface SupabaseSubcategory {
  id: string;
  slug: string;
  name_zh: string;
  name_ja: string;
  description_zh?: string;
  description_ja?: string;
  sort_order: number;
  items: SupabaseItem[];
}

export interface SupabaseCategory {
  id: string;
  slug: string;
  name_zh: string;
  name_ja: string;
  icon: string;
  sort_order: number;
  subcategories: SupabaseSubcategory[];
}

export interface SupabaseProjectResponse {
  id: string;
  slug: string;
  name_zh: string;
  name_ja: string;
  description_zh: string;
  description_ja: string;
  categories: SupabaseCategory[];
}

// Context 类型
export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLanguageReady: boolean;
}

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
