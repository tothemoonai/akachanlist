# User Authentication and Personal Lists Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user authentication (magic link), personal list management, and shopping list features to the multilingual pregnancy checklist application.

**Architecture:** Client-side React app with Supabase Auth for authentication, Supabase PostgreSQL for user data storage, React Query for data fetching and caching, React Context for state management. Authentication state persists across sessions via Supabase session cookies.

**Tech Stack:** React 18, TypeScript, Vite, Supabase (Auth + PostgreSQL), React Query (@tanstack/react-query), Tailwind CSS 4.2

---

## File Structure

### New Files to Create

**Database:**
- `supabase/migrations/003_add_user_lists.sql` - User lists and list items tables with RLS policies

**Types:**
- `src/types/index.ts` (modify) - Add user-related types (AuthUser, SupabaseUserList, SupabaseUserListItem, etc.)

**Context:**
- `src/contexts/UserListContext.tsx` - Main context for user auth state and list management

**Components (src/components/user/):**
- `AuthButton.tsx` - Login/logout button with magic link email dialog
- `ListSidebar.tsx` - Sidebar drawer for managing all user lists
- `ShoppingListView.tsx` - Modal showing unified shopping list
- `CreateListDialog.tsx` - Dialog for creating new lists
- `ConfirmDialog.tsx` - Generic confirmation dialog for destructive actions
- `ListItemSelector.tsx` - Component for adding items from master list to user lists

**Utilities:**
- `src/utils/validation.ts` - Input validation functions and rules

**Hooks:**
- `src/hooks/useAuth.ts` - Hook for Supabase Auth state management

### Files to Modify

- `src/lib/supabase.ts` - Add Auth helpers (already has supabase client)
- `src/App.tsx` - Add UserListProvider and QueryClientProvider
- `src/pages/Home.tsx` - Integrate new UI components
- `src/components/Header.tsx` - Add AuthButton and "My Lists" button
- `src/components/ItemCard.tsx` - Add ListItemSelector integration

---

## Task Breakdown

### Phase 1.1: Foundation (Database, Types, Auth Setup)

#### Task 1: Create database migration for user lists

**Files:**
- Create: `supabase/migrations/003_add_user_lists.sql`

- [ ] **Step 1: Write migration file**

```sql
-- Migration: Add user authentication and personal lists
-- Date: 2026-03-23
-- Depends on: 001_initial_schema.sql, 002_insert_data.sql

-- Create user_lists table
CREATE TABLE IF NOT EXISTS user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  share_token UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_list_items table
CREATE TABLE IF NOT EXISTS user_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_list_id UUID NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('required', 'recommended', 'optional')),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0 AND quantity <= 99),
  is_purchased BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_list_id, item_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_lists_user ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_share ON user_lists(share_token) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_list_items_list ON user_list_items(user_list_id);
CREATE INDEX IF NOT EXISTS idx_user_list_items_item ON user_list_items(item_id);
CREATE INDEX IF NOT EXISTS idx_user_list_items_purchased ON user_list_items(user_list_id, is_purchased);

-- Enable RLS
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_lists
CREATE POLICY "Users can view own lists"
  ON user_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lists"
  ON user_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists"
  ON user_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists"
  ON user_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Public read access via share token
CREATE POLICY "Public can view shared lists"
  ON user_lists FOR SELECT
  USING (is_public = TRUE AND share_token IS NOT NULL);

-- RLS Policies for user_list_items
CREATE POLICY "Users can view items in own lists"
  ON user_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = user_list_items.user_list_id
      AND user_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items into own lists"
  ON user_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = user_list_items.user_list_id
      AND user_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own lists"
  ON user_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = user_list_items.user_list_id
      AND user_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in own lists"
  ON user_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = user_list_items.user_list_id
      AND user_lists.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function (if not exists from migration 001)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_lists_updated_at ON user_lists;
CREATE TRIGGER update_user_lists_updated_at BEFORE UPDATE ON user_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_list_items_updated_at ON user_list_items;
CREATE TRIGGER update_user_list_items_updated_at BEFORE UPDATE ON user_list_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification queries
-- SELECT COUNT(*) FROM user_lists; -- Should return 0
-- SELECT COUNT(*) FROM user_list_items; -- Should return 0
```

- [ ] **Step 2: Commit migration file**

```bash
git add supabase/migrations/003_add_user_lists.sql
git commit -m "feat: add database migration for user lists and list items"
```

#### Task 2: Extend TypeScript types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add user-related types to end of file**

```typescript
// Add after existing types (around line 96)

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
```

- [ ] **Step 2: Commit type changes**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript types for user authentication and personal lists"
```

#### Task 3: Create validation utilities

**Files:**
- Create: `src/utils/validation.ts`

- [ ] **Step 1: Write validation utilities**

```typescript
import { VALIDATION_RULES } from '../types';

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email);
};

export const validateListName = (name: string): { valid: boolean; error?: string } => {
  if (name.length < VALIDATION_RULES.LIST_NAME.MIN_LENGTH) {
    return { valid: false, error: '清单名称不能为空' };
  }
  if (name.length > VALIDATION_RULES.LIST_NAME.MAX_LENGTH) {
    return { valid: false, error: '清单名称不能超过100个字符' };
  }
  if (!VALIDATION_RULES.LIST_NAME.PATTERN.test(name)) {
    return { valid: false, error: '清单名称包含非法字符' };
  }
  return { valid: true };
};

export const validateQuantity = (qty: number): boolean => {
  const numQty = Number(qty);
  return !isNaN(numQty)
    && numQty >= VALIDATION_RULES.QUANTITY.MIN
    && numQty <= VALIDATION_RULES.QUANTITY.MAX;
};

export const validateListDescription = (description: string): boolean => {
  return description.length <= VALIDATION_RULES.LIST_DESCRIPTION.MAX_LENGTH;
};
```

- [ ] **Step 2: Commit validation utilities**

```bash
git add src/utils/validation.ts
git commit -m "feat: add input validation utilities"
```

#### Task 4: Create Auth hook

**Files:**
- Create: `src/hooks/useAuth.ts`

- [ ] **Step 1: Write useAuth hook**

```typescript
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthUser } from '../types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      const { data: { session } } = await supabase?.auth.getSession();
      setSession(session ?? null);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session ?? null);
        setUser(session?.user ?? null);
      }
    ) ?? { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string): Promise<{ error: string | null }> => {
    if (!supabase) {
      return { error: 'Supabase未配置' };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signOut = async (): Promise<void> => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
```

- [ ] **Step 2: Commit useAuth hook**

```bash
git add src/hooks/useAuth.ts
git commit -m "feat: add useAuth hook for Supabase authentication"
```

---

### Phase 1.2: Context and Data Layer

#### Task 5: Create UserListContext

**Files:**
- Create: `src/contexts/UserListContext.tsx`

- [ ] **Step 1: Write UserListContext**

```typescript
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { AuthUser, SupabaseUserList, SupabaseUserListItem, CreateListForm } from '../types';
import { useAuth } from '../hooks/useAuth';

interface UserListContextType {
  user: AuthUser | null;
  currentList: SupabaseUserList | null;
  lists: SupabaseUserList[];
  listItems: SupabaseUserListItem[];
  setCurrentList: (list: SupabaseUserList | null) => void;
  createList: (data: CreateListForm) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  addItem: (listId: string, itemId: string, priority: string, quantity: number) => Promise<void>;
  removeItem: (listItemId: string) => Promise<void>;
  updateItem: (listItemId: string, priority: string, quantity: number) => Promise<void>;
  togglePurchased: (listItemId: string) => Promise<void>;
  resetPurchasedItem: (listItemId: string) => Promise<void>;
}

const UserListContext = createContext<UserListContextType | null>(null);

export function UserListProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentList, setCurrentList] = useState<SupabaseUserList | null>(null);

  // Fetch user lists
  const { data: lists = [] } = useQuery({
    queryKey: ['userLists', user?.id],
    queryFn: async () => {
      if (!user || !supabase) return [];

      const { data, error } = await supabase
        .from('user_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SupabaseUserList[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch items for current list
  const { data: listItems = [] } = useQuery({
    queryKey: ['listItems', currentList?.id],
    queryFn: async () => {
      if (!currentList || !supabase) return [];

      const { data, error } = await supabase
        .from('user_list_items')
        .select('*, items(id, name_zh, name_ja, description_zh, description_ja)')
        .eq('user_list_id', currentList.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as SupabaseUserListItem[];
    },
    enabled: !!currentList,
    staleTime: 5 * 60 * 1000,
  });

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: async (data: CreateListForm) => {
      if (!user || !supabase) throw new Error('Not authenticated');

      const { data: newList, error } = await supabase
        .from('user_lists')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description,
        })
        .select()
        .single();

      if (error) throw error;
      return newList as SupabaseUserList;
    },
    onSuccess: (newList) => {
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
      setCurrentList(newList);
    },
  });

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('user_lists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
      if (currentList) {
        setCurrentList(null);
      }
    },
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async ({
      listId,
      itemId,
      priority,
      quantity,
    }: {
      listId: string;
      itemId: string;
      priority: string;
      quantity: number;
    }) => {
      if (!supabase) throw new Error('Supabase not configured');

      const { data, error } = await supabase
        .from('user_list_items')
        .insert({
          user_list_id: listId,
          item_id: itemId,
          priority,
          quantity,
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation (item already in list)
        if (error.code === '23505') {
          const errorMessage = language === 'zh'
            ? '该物品已在清单中'
            : 'このアイテムはすでにリストにあります';
          throw new Error(errorMessage);
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listItems'] });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (listItemId: string) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase
        .from('user_list_items')
        .delete()
        .eq('id', listItemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listItems'] });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({
      listItemId,
      priority,
      quantity,
    }: {
      listItemId: string;
      priority: string;
      quantity: number;
    }) => {
      if (!supabase) throw new Error('Supabase not configured');

      const { error } = await supabase
        .from('user_list_items')
        .update({ priority, quantity })
        .eq('id', listItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listItems'] });
    },
  });

  // Toggle purchased mutation
  const togglePurchasedMutation = useMutation({
    mutationFn: async (listItemId: string) => {
      if (!supabase) throw new Error('Supabase not configured');

      // First get current state
      const { data: currentItem } = await supabase
        .from('user_list_items')
        .select('is_purchased')
        .eq('id', listItemId)
        .single();

      if (!currentItem) throw new Error('Item not found');

      const newValue = !currentItem.is_purchased;

      const { error } = await supabase
        .from('user_list_items')
        .update({
          is_purchased: newValue,
          purchased_at: newValue ? new Date().toISOString() : null,
        })
        .eq('id', listItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listItems'] });
    },
  });

  const createList = useCallback(async (data: CreateListForm) => {
    await createListMutation.mutateAsync(data);
  }, [createListMutation]);

  const deleteList = useCallback(async (id: string) => {
    await deleteListMutation.mutateAsync(id);
  }, [deleteListMutation]);

  const addItem = useCallback(async (
    listId: string,
    itemId: string,
    priority: string,
    quantity: number
  ) => {
    await addItemMutation.mutateAsync({ listId, itemId, priority, quantity });
  }, [addItemMutation]);

  const removeItem = useCallback(async (listItemId: string) => {
    await removeItemMutation.mutateAsync(listItemId);
  }, [removeItemMutation]);

  const updateItem = useCallback(async (
    listItemId: string,
    priority: string,
    quantity: number
  ) => {
    await updateItemMutation.mutateAsync({ listItemId, priority, quantity });
  }, [updateItemMutation]);

  const togglePurchased = useCallback(async (listItemId: string) => {
    await togglePurchasedMutation.mutateAsync(listItemId);
  }, [togglePurchasedMutation]);

  const resetPurchasedItem = useCallback(async (listItemId: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('user_list_items')
      .update({
        is_purchased: false,
        purchased_at: null,
      })
      .eq('id', listItemId);

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['listItems'] });
  }, [queryClient, supabase]);

  return (
    <UserListContext.Provider
      value={{
        user: user ?? null,
        currentList,
        lists,
        listItems,
        setCurrentList,
        createList,
        deleteList,
        addItem,
        removeItem,
        updateItem,
        togglePurchased,
        resetPurchasedItem,
      }}
    >
      {children}
    </UserListContext.Provider>
  );
}

export function useUserList() {
  const context = useContext(UserListContext);
  if (!context) {
    throw new Error('useUserList must be used within UserListProvider');
  }
  return context;
}
```

- [ ] **Step 2: Commit UserListContext**

```bash
git add src/contexts/UserListContext.tsx
git commit -m "feat: add UserListContext for state management"
```

---

### Phase 1.3: UI Components

#### Task 6: Create AuthButton component

**Files:**
- Create: `src/components/user/AuthButton.tsx`

- [ ] **Step 1: Create user components directory**

```bash
mkdir -p src/components/user
```

- [ ] **Step 2: Write AuthButton component**

```typescript
import { useState } from 'react';
import { Mail, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateEmail } from '../../utils/validation';

export function AuthButton() {
  const { user, signIn, signOut, loading } = useAuth();
  const { language } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (loading) {
    return <div className="w-20 h-8 bg-gray-200 animate-pulse rounded" />;
  }

  const handleLoginClick = () => {
    setShowDialog(true);
    setEmail('');
    setMessage(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: language === 'zh' ? '请输入有效的邮箱地址' : '有効なメールアドレスを入力してください' });
      return;
    }

    setSubmitting(true);
    const { error } = await signIn(email);

    if (error) {
      setMessage({ type: 'error', text: error });
    } else {
      setMessage({
        type: 'success',
        text: language === 'zh'
          ? '登录链接已发送到您的邮箱，请查收'
          : 'ログインリンクをメールで送信しました'
      });
      setEmail('');
    }

    setSubmitting(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 hidden sm:inline">{user.email}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title={language === 'zh' ? '登出' : 'ログアウト'}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{language === 'zh' ? '登出' : 'ログアウト'}</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleLoginClick}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors"
      >
        <Mail className="w-4 h-4" />
        {language === 'zh' ? '登录' : 'ログイン'}
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'zh' ? '登录' : 'ログイン'}
            </h2>

            {!message ? (
              <form onSubmit={handleEmailSubmit}>
                <p className="text-sm text-gray-600 mb-4">
                  {language === 'zh'
                    ? '输入您的邮箱地址，我们将发送登录链接给您'
                    : 'メールアドレスを入力すると、ログインリンクを送信します'}
                </p>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === 'zh' ? 'your@email.com' : 'your@email.com'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-4"
                  autoFocus
                />

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDialog(false)}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {language === 'zh' ? '取消' : 'キャンセル'}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !email}
                    className="px-4 py-2 text-sm text-white bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 rounded-lg transition-colors"
                  >
                    {submitting
                      ? (language === 'zh' ? '发送中...' : '送信中...')
                      : (language === 'zh' ? '发送链接' : 'リンクを送信')
                    }
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className={`text-sm mb-4 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                  {message.text}
                </p>

                {message.type === 'success' && (
                  <p className="text-xs text-gray-500 mb-4">
                    {language === 'zh'
                      ? '请检查您的邮箱并点击链接完成登录'
                      : 'メールを確認し、リンクをクリックしてログインを完了してください'}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDialog(false)}
                    className="px-4 py-2 text-sm text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors"
                  >
                    {language === 'zh' ? '关闭' : '閉じる'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Commit AuthButton**

```bash
git add src/components/user/AuthButton.tsx
git commit -m "feat: add AuthButton component with magic link login"
```

#### Task 7: Create CreateListDialog component

**Files:**
- Create: `src/components/user/CreateListDialog.tsx`

- [ ] **Step 1: Write CreateListDialog component**

```typescript
import { useState, useEffect } from 'react';
import { useUserList } from '../../contexts/UserListContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateListName, validateListDescription } from '../../utils/validation';

interface CreateListDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateListDialog({ isOpen, onClose }: CreateListDialogProps) {
  const { createList } = useUserList();
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    const nameValidation = validateListName(name);
    if (!nameValidation.valid) {
      setErrors({ name: nameValidation.error });
      return;
    }

    // Validate description if provided
    if (description && !validateListDescription(description)) {
      setErrors({ name: language === 'zh' ? '描述过长' : '説明が長すぎます' });
      return;
    }

    setSubmitting(true);

    try {
      await createList({
        name,
        description: description || undefined,
      });
      onClose();
    } catch (error) {
      setErrors({ name: (error as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {language === 'zh' ? '创建新清单' : '新しいリストを作成'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'zh' ? '清单名称' : 'リスト名'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'zh' ? '例如：待产包清单' : '例：出産準備リスト'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              maxLength={100}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'zh' ? '描述（可选）' : '説明（任意）'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'zh' ? '添加一些备注...' : 'メモを追加...'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {language === 'zh' ? '取消' : 'キャンセル'}
            </button>
            <button
              type="submit"
              disabled={submitting || !name}
              className="px-4 py-2 text-sm text-white bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 rounded-lg transition-colors"
            >
              {submitting
                ? (language === 'zh' ? '创建中...' : '作成中...')
                : (language === 'zh' ? '创建' : '作成')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit CreateListDialog**

```bash
git add src/components/user/CreateListDialog.tsx
git commit -m "feat: add CreateListDialog component"
```

#### Task 8: Create ConfirmDialog component

**Files:**
- Create: `src/components/user/ConfirmDialog.tsx`

- [ ] **Step 1: Write ConfirmDialog component**

```typescript
import { useLanguage } from '../../contexts/LanguageContext';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const defaultConfirmLabel = language === 'zh' ? '确认' : '確認';
  const defaultCancelLabel = language === 'zh' ? '取消' : 'キャンセル';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-600 mb-6">{message}</p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {cancelLabel || defaultCancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                {confirmLabel || defaultConfirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit ConfirmDialog**

```bash
git add src/components/user/ConfirmDialog.tsx
git commit -m "feat: add ConfirmDialog component for destructive actions"
```

#### Task 9: Create ListSidebar component

**Files:**
- Create: `src/components/user/ListSidebar.tsx`

- [ ] **Step 1: Write ListSidebar component**

```typescript
import { useState } from 'react';
import { X, Plus, Trash2, ChevronRight } from 'lucide-react';
import { useUserList } from '../../contexts/UserListContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CreateListDialog } from './CreateListDialog';
import { ConfirmDialog } from './ConfirmDialog';

interface ListSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ListSidebar({ isOpen, onClose }: ListSidebarProps) {
  const { lists, currentList, setCurrentList, deleteList } = useUserList();
  const { language } = useLanguage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  const handleDeleteList = async () => {
    if (listToDelete) {
      await deleteList(listToDelete);
      setListToDelete(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">
              {language === 'zh' ? '我的清单' : 'マイリスト'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {lists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-4">
                  {language === 'zh'
                    ? '还没有创建任何清单'
                    : 'まだリストを作成していません'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className={`
                      group flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer
                      ${currentList?.id === list.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => {
                        setCurrentList(list);
                        onClose();
                      }}
                    >
                      <p className="font-medium text-gray-900 truncate">{list.name}</p>
                      {list.description && (
                        <p className="text-xs text-gray-500 truncate">{list.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          currentList?.id === list.id ? 'text-pink-500' : 'text-gray-400'
                        }`}
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setListToDelete(list.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title={language === 'zh' ? '删除' : '削除'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Create Button */}
          <div className="p-4 border-t">
            <button
              onClick={() => setShowCreateDialog(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {language === 'zh' ? '创建新清单' : '新しいリスト'}
            </button>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <CreateListDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!listToDelete}
        title={language === 'zh' ? '删除清单' : 'リストを削除'}
        message={
          language === 'zh'
            ? '确定要删除这个清单吗？此操作无法撤销。'
            : 'このリストを削除してもよろしいですか？この操作は元に戻せません。'
        }
        confirmLabel={language === 'zh' ? '删除' : '削除'}
        onConfirm={handleDeleteList}
        onCancel={() => setListToDelete(null)}
      />
    </>
  );
}
```

- [ ] **Step 2: Commit ListSidebar**

```bash
git add src/components/user/ListSidebar.tsx
git commit -m "feat: add ListSidebar component for managing user lists"
```

#### Task 10: Create ListItemSelector component

**Files:**
- Create: `src/components/user/ListItemSelector.tsx`

- [ ] **Step 1: Write ListItemSelector component**

```typescript
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
```

- [ ] **Step 2: Commit ListItemSelector**

```bash
git add src/components/user/ListItemSelector.tsx
git commit -m "feat: add ListItemSelector component for adding items to lists"
```

#### Task 11: Create ShoppingListView component

**Files:**
- Create: `src/components/user/ShoppingListView.tsx`

- [ ] **Step 1: Write ShoppingListView component**

```typescript
import { useQuery } from '@tanstack/react-query';
import { X, ShoppingCart, Check, RotateCcw } from 'lucide-react';
import { useUserList } from '../../contexts/UserListContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

interface ShoppingListViewProps {
  isOpen: boolean;
  onClose: () => void;
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
      return data;
    },
    enabled: isOpen && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Group items by list and separate purchased/unpurchased
  const unpurchasedGroups = allItems
    .filter(item => !item.is_purchased)
    .reduce((acc, item) => {
      const listId = item.user_list_id;
      if (!acc[listId]) {
        acc[listId] = {
          list_id: listId,
          list_name: (item.user_lists as any).name,
          items: [],
        };
      }
      acc[listId].items.push(item);
      return acc;
    }, {} as Record<string, { list_id: string; list_name: string; items: any[] }>);

  const purchasedGroups = allItems
    .filter(item => item.is_purchased)
    .reduce((acc, item) => {
      const listId = item.user_list_id;
      if (!acc[listId]) {
        acc[listId] = {
          list_id: listId,
          list_name: (item.user_lists as any).name,
          items: [],
        };
      }
      acc[listId].items.push(item);
      return acc;
    }, {} as Record<string, { list_id: string; list_name: string; items: any[] }>);

  const unpurchasedCount = Object.values(unpurchasedGroups).reduce(
    (sum, group) => sum + group.items.length,
    0
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
                          {group.items.map((item: any) => (
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
                                  {language === 'zh' ? item.items?.name_zh : item.items?.name_ja}
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
                          {group.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2 bg-gray-50 border rounded-lg"
                            >
                              <div className="flex-shrink-0 w-5 h-5 bg-pink-500 rounded flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-through">
                                  {language === 'zh' ? item.items?.name_zh : item.items?.name_ja}
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
```

- [ ] **Step 2: Commit ShoppingListView**

```bash
git add src/components/user/ShoppingListView.tsx
git commit -m "feat: add ShoppingListView component"
```

---

### Phase 1.4: Integration

#### Task 12: Update App.tsx with providers

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add QueryClientProvider and UserListProvider**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserListProvider } from './contexts/UserListContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import './styles/index.css';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <UserListProvider>
            <Home />
          </UserListProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
```

- [ ] **Step 2: Commit App.tsx changes**

```bash
git add src/App.tsx
git commit -m "feat: integrate QueryClientProvider and UserListProvider"
```

#### Task 13: Update Header component

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: Add AuthButton and "My Lists" button to Header**

```typescript
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserList } from '../contexts/UserListContext';
import { AuthButton } from './user/AuthButton';
import { Menu } from 'lucide-react';
import { ListSidebar } from './user/ListSidebar';
import { ShoppingListView } from './user/ShoppingListView';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { language } = useLanguage();
  const { user, currentList } = useUserList();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <AuthButton />

              {user && (
                <>
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Menu className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {language === 'zh' ? '我的清单' : 'マイリスト'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowShoppingList(true)}
                    className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {currentList && (
            <div className="mt-3 text-sm text-pink-600 font-medium">
              {language === 'zh' ? '当前清单：' : '現在のリスト：'}{currentList.name}
            </div>
          )}
        </div>
      </header>

      <ListSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
      <ShoppingListView isOpen={showShoppingList} onClose={() => setShowShoppingList(false)} />
    </>
  );
}
```

- [ ] **Step 2: Commit Header changes**

```bash
git add src/components/Header.tsx
git commit -m "feat: integrate auth and list management UI into Header"
```

#### Task 14: Update ItemCard component

**Files:**
- Modify: `src/components/ItemCard.tsx`
- Modify: `src/components/CategorySection.tsx`

- [ ] **Step 1: Read current ItemCard structure**

```bash
cat src/components/ItemCard.tsx
```

Current ItemCard has this structure:
- Receives `item` prop with name, priority, description, quantity, notes
- Displays item information in a card layout
- Shows priority badge

- [ ] **Step 2: Add ListItemSelector to ItemCard**

Update `src/components/ItemCard.tsx`:

```typescript
import { ListItemSelector } from './user/ListItemSelector';

interface ItemCardProps {
  item: {
    name: string;
    priority?: string;
    description?: string;
    quantity?: string;
    notes?: string;
  };
  itemId?: string; // NEW: Supabase UUID
}

export function ItemCard({ item, itemId }: ItemCardProps) {
  // ... existing code ...

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Existing item display code */}

      {/* ADD THIS: ListItemSelector at the bottom of the card */}
      {itemId && (
        <div className="mt-4 pt-4 border-t">
          <ListItemSelector item={item} itemId={itemId} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update data fetching to include item IDs**

The challenge is that items from Supabase need their UUIDs passed to ItemCard. Update `src/hooks/useProjectData.ts`:

```typescript
// In the data transformation, add a map of item names to IDs
// This will require modifying the fetch to include IDs from Supabase

// Or, simpler: Update CategorySection to pass IDs when available
```

- [ ] **Step 4: Alternative approach - fetch items with IDs**

Modify `src/utils/data.ts` to preserve Supabase item IDs:

```typescript
// When transforming Supabase data to app format, include the id
export function transformData(data: SupabaseProjectResponse, lang: Language): ItemsData {
  return {
    meta: {
      title: lang === 'zh' ? data.name_zh : data.name_ja,
      subtitle: lang === 'zh' ? data.description_zh : data.description_ja,
      lastUpdated: new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'ja-JP'),
    },
    categories: data.categories.map((category) => ({
      id: category.id, // Keep Supabase UUID
      title: lang === 'zh' ? category.name_zh : category.name_ja,
      icon: category.icon,
      subcategories: category.subcategories.map((subcategory) => ({
        id: subcategory.id,
        title: lang === 'zh' ? subcategory.name_zh : subcategory.name_ja,
        description: lang === 'zh' ? subcategory.description_zh : subcategory.description_ja,
        items: subcategory.items.map((item) => ({
          name: lang === 'zh' ? item.name_zh : item.name_ja,
          priority: item.priority,
          description: lang === 'zh' ? item.description_zh : item.description_ja,
          quantity: lang === 'zh' ? item.quantity_zh : item.quantity_ja,
          notes: lang === 'zh' ? item.notes_zh : item.notes_ja,
          id: item.id, // ADD THIS: Include Supabase item ID
        })),
      })),
    })),
  };
}
```

- [ ] **Step 5: Update types to include id**

Modify `src/types/index.ts`:

```typescript
export interface Item {
  id?: string; // ADD THIS: Supabase UUID (optional for backward compatibility)
  name: string;
  priority: Priority;
  description?: string;
  quantity?: string;
  notes?: string;
}
```

- [ ] **Step 6: Commit ItemCard changes**

```bash
git add src/components/ItemCard.tsx src/components/CategorySection.tsx src/utils/data.ts src/types/index.ts
git commit -m "feat: add ListItemSelector to ItemCard for adding items to user lists"
```

#### Task 15: Update Home page to show current list items (optional enhancement)

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Add current list indicator**

This is optional - you can add a section showing items from the current user's list.

- [ ] **Step 2: Commit Home changes**

```bash
git add src/pages/Home.tsx
git commit -m "feat: add current list indicator to Home page"
```

---

### Phase 1.5: Testing and Deployment

#### Task 16: Run database migration

- [ ] **Step 1: Execute migration in Supabase Dashboard**

1. Go to https://supabase.com/dashboard/project/wnyrinifinvgagbtlpwb/sql/new
2. Copy contents of `supabase/migrations/003_add_user_lists.sql`
3. Paste and execute
4. Verify success with: `SELECT COUNT(*) FROM user_lists;` (should return 0)

- [ ] **Step 2: Configure Supabase Auth**

Before testing authentication, verify Supabase Auth is properly configured:

1. Go to https://supabase.com/dashboard/project/wnyrinifinvgagbtlpwb/auth/templates
2. Verify "Email Provider" is enabled
3. Check "Email Templates" → "Magic Link" / "Email Link"
4. Verify redirect URLs include:
   - Production: `https://akachanlist.vercel.app/**`
   - Development: `http://localhost:5173/**`
5. Test email delivery by sending a test magic link (if available)

- [ ] **Step 3: Update environment variables (if needed)**

Ensure `.env.local` has correct Supabase URL and anon key.

#### Task 17: Test the application

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test authentication flow**

1. Visit http://localhost:5173
2. Click "登录" button
3. Enter email address
4. Check email for magic link
5. Click link to authenticate
6. Verify user is logged in (email shown in header)

- [ ] **Step 3: Test list management**

1. Click "我的清单" button
2. Create new list
3. Switch between lists
4. Delete list with confirmation

- [ ] **Step 4: Test item management**

1. Browse master checklist
2. Click "添加到清单" on an item
3. Set priority and quantity
4. Update item
5. Remove item

- [ ] **Step 5: Test shopping list**

1. Click shopping cart icon
2. Verify items shown by list
3. Mark items as purchased
4. Reset purchased items

- [ ] **Step 6: Test both languages**

Repeat tests with language set to Japanese (click "日本語" button).

#### Task 18: Build and deploy

- [ ] **Step 1: Build production version**

```bash
npm run build
```

- [ ] **Step 2: Preview build**

```bash
npm run preview
```

- [ ] **Step 3: Deploy to Vercel**

```bash
npx vercel --prod
```

- [ ] **Step 4: Update environment variables in Vercel**

Go to Vercel Dashboard → Environment Variables and ensure Supabase credentials are set for production.

---

## Verification Checklist

After completing all tasks, verify:

- [ ] Database migration executed successfully
- [ ] All new components render without errors
- [ ] Magic link authentication works
- [ ] Users can create/delete lists
- [ ] Users can add items from master list to personal lists
- [ ] Priority and quantity settings work
- [ ] Shopping list shows all unpurchased items
- [ ] Purchased items can be reset
- [ ] All UI text is bilingual (Chinese/Japanese)
- [ ] Responsive design works on mobile
- [ ] Application works in both languages
- [ ] No console errors
- [ ] TypeScript compilation succeeds
- [ ] Production build succeeds

---

## Notes

- **First Time Setup**: Users must create at least one list before adding items
- **Item IDs**: The master checklist items need their Supabase UUIDs passed to ListItemSelector
- **Offline Fallback**: If Supabase is unavailable, show appropriate error messages (localStorage fallback can be added in Phase 2)
- **Mobile Testing**: Test floating button position on actual mobile devices (iOS Safari, Chrome Android)
- **Email Templates**: Customize magic link email templates in Supabase Dashboard for better UX

---

**End of Implementation Plan**
