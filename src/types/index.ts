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
  id?: string; // Supabase UUID (optional for backward compatibility)
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

// ============================================
// User Authentication & Personal Lists Types
// ============================================

// Supabase auth user type
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

// User list from Supabase
export interface SupabaseUserList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  share_token?: string;
  created_at: string;
  updated_at: string;
}

// User list item with joined item details
export interface SupabaseUserListItem {
  id: string;
  user_list_id: string;
  item_id: string;
  priority: 'required' | 'recommended' | 'optional';
  quantity: number;
  is_purchased: boolean;
  purchased_at?: string;
  created_at: string;
  updated_at: string;
  // Joined from items table
  item?: {
    id: string;
    name_zh: string;
    name_ja: string;
    description_zh?: string;
    description_ja?: string;
  };
}

// Enriched user list with stats
export interface UserListWithStats extends SupabaseUserList {
  total_items: number;
  purchased_items: number;
}

// Shopping list grouped by parent list
export interface ShoppingListGroup {
  list_id: string;
  list_name: string;
  items: SupabaseUserListItem[];
}

// Form types
export interface CreateListForm {
  name: string;
  description?: string;
}

export interface UpdateListItemForm {
  priority?: 'required' | 'recommended' | 'optional';
  quantity?: number;
}

// Validation rules
export const VALIDATION_RULES = {
  LIST_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[^<>{}$]*$/,
  },
  LIST_DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  QUANTITY: {
    MIN: 1,
    MAX: 99,
  },
} as const;
