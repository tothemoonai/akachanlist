# User Authentication and Personal Lists Feature Design

**Date:** 2026-03-23
**Project:** akachanlist
**Status:** Phase 1 Design Approved

---

## Overview

Add user authentication and personal list management capabilities to the multilingual pregnancy checklist application, enabling users to create custom lists from the master checklist, track shopping progress, and manage item notes.

---

## Goals

1. Enable user authentication via magic link (email-based, passwordless)
2. Allow users to create multiple personal lists from the master checklist
3. Support item selection with priority and quantity management
4. Provide a unified shopping list view across all personal lists
5. Facilitate list sharing via unique tokens

---

## Phase 1 Features (MVP)

### Authentication
- Magic link login (email-based, no password)
- User session management via Supabase Auth
- Persistent auth state across page refreshes
- Login/logout UI in top navigation bar

### Supabase Auth Configuration
**Required Setup:**
1. Enable Email Auth in Supabase Dashboard:
   - Navigate to Authentication → Providers
   - Enable Email provider
   - Enable "Enable email confirmations"
   - Set "Email Template" for magic link

2. Configure Redirect URLs:
   - In Supabase Dashboard → Authentication → URL Configuration
   - Add allowed redirect URLs:
     - Production: `https://akachanlist.vercel.app/**`
     - Development: `http://localhost:5173/**`

3. Email Settings:
   - Configure SMTP settings in Supabase Dashboard or use built-in email service
   - Customize email templates for magic link (optional)

4. Client-Side Handler:
   - Listen for `#access_token` in URL hash on app load
   - Exchange token for session using `supabase.auth.getSession()`
   - Handle auth state changes with `supabase.auth.onAuthStateChange()`

### Personal List Management
- Create multiple named lists
- Add items from master checklist to personal lists
- Set priority (required/recommended/optional) per item
- Set quantity per item
- Remove items from lists
- Delete entire lists

### Shopping List
- Unified view of all unpurchased items across all lists
- Mark items as purchased/unpurchased
- Group items by parent list
- Floating action button for quick access

### UI Components
- Auth button (top navigation)
- List sidebar drawer (left slide-out)
- Shopping list modal (overlay)
- Create list dialog
- Item selector with priority/quantity controls

---

## Data Model

### New Tables

```sql
-- User Lists
CREATE TABLE user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  share_token UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- List Items
CREATE TABLE user_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_list_id UUID NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('required', 'recommended', 'optional')),
  quantity INTEGER DEFAULT 1,
  is_purchased BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_list_id, item_id)
);
```

### Indexes

```sql
CREATE INDEX idx_user_lists_user ON user_lists(user_id);
CREATE INDEX idx_user_lists_share ON user_lists(share_token) WHERE is_public = TRUE;
CREATE INDEX idx_user_list_items_list ON user_list_items(user_list_id);
CREATE INDEX idx_user_list_items_item ON user_list_items(item_id);
CREATE INDEX idx_user_list_items_purchased ON user_list_items(user_list_id, is_purchased);
```

### RLS Policies

```sql
-- User lists: users can CRUD their own lists
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

-- List items: users can CRUD items in their own lists
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

CREATE POLICY "Users can delete items from own lists"
  ON user_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = user_list_items.user_list_id
      AND user_lists.user_id = auth.uid()
    )
  );
```

### Database Migration Details

**Migration file:** `supabase/migrations/003_add_user_lists.sql`

```sql
-- Migration: Add user authentication and personal lists
-- Date: 2026-03-23
-- Depends on: 001_initial_schema.sql, 002_insert_data.sql

-- Note: auth.users table is managed by Supabase Auth
-- No need to create it manually

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

-- [RLS policies from previous section]

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_lists_updated_at BEFORE UPDATE ON user_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_list_items_updated_at BEFORE UPDATE ON user_list_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification query (run after migration to verify)
-- SELECT COUNT(*) FROM user_lists; -- Should return 0
-- SELECT COUNT(*) FROM user_list_items; -- Should return 0
```

**Migration Execution:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire migration file content
3. Execute the SQL
4. Verify success by running the verification queries
5. Check that new tables appear in Table Editor

---

## Component Architecture

### New Components

#### `AuthButton.tsx`
- **Purpose:** Handle user authentication UI
- **Props:** None
- **State:**
  - `showLoginDialog: boolean`
  - `email: string`
  - `loading: boolean`
  - `error: string | null`
- **Behavior:**
  - Not logged in: Show "Login" button
  - Logged in: Show user email + "Logout" button
  - Login opens dialog for email input
  - Call `supabase.auth.signInWithOtp()`

#### `ListSidebar.tsx`
- **Purpose:** Manage all user lists
- **Props:**
  - `isOpen: boolean`
  - `onClose: () => void`
- **State:**
  - `lists: UserList[]`
  - `currentListId: string | null`
  - `showCreateDialog: boolean`
- **Behavior:**
  - Slide-in drawer from left
  - Display all user lists
  - Highlight current list
  - Create new list button
  - Switch list on click
  - Edit/delete actions

#### `ShoppingListView.tsx`
- **Purpose:** Unified shopping list view
- **Props:**
  - `isOpen: boolean`
  - `onClose: () => void`
- **State:**
  - `unpurchasedItems: UserListItem[]`
  - `purchasedItems: UserListItem[]`
  - `loading: boolean`
- **Behavior:**
  - Modal overlay with backdrop
  - Group items by parent list
  - Toggle purchased status with checkbox
  - Show quantity controls
  - **Reset button** for purchased items:
    - Moves item from "Purchased" to "To Purchase" section
    - Sets `is_purchased = false`, `purchased_at = null`
    - For consumables, allows re-purchasing same item
  - Loading skeleton while fetching data

#### `CreateListDialog.tsx`
- **Purpose:** Create new user list
- **Props:**
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onCreate: (name: string, description?: string) => void`
- **State:**
  - `name: string`
  - `description: string`
  - `errors: { name?: string }`
  - `submitting: boolean`
- **Behavior:**
  - Modal dialog form
  - Validate name not empty and meets validation rules
  - Show validation errors inline
  - Disable submit while submitting
  - Show loading spinner on submit button

#### `ConfirmDialog.tsx` (New)
- **Purpose:** Generic confirmation dialog for destructive actions
- **Props:**
  - `isOpen: boolean`
  - `title: string`
  - `message: string`
  - `confirmLabel?: string` (default: "确认" / "Confirm")
  - `cancelLabel?: string` (default: "取消" / "Cancel")
  - `onConfirm: () => void`
  - `onCancel: () => void`
- **Behavior:**
  - Modal overlay with danger color scheme
  - Used for: delete list, remove item, clear all items
  - Respects current language setting

#### `ListItemSelector.tsx`
- **Purpose:** Add items from master list to user list
- **Props:**
  - `item: Item`
  - `isInList: boolean`
  - `onAdd: (priority, quantity) => void`
  - `onRemove: () => void`
  - `onUpdate: (priority, quantity) => void`
- **Behavior:**
  - Show "Add to list" button when not in list
  - Show priority/quantity controls when in list
  - Remove button
  - Update button

### Data Context

#### `UserListContext.tsx`
- **State:**
  - `user: AuthUser | null` (from Supabase Auth)
  - `session: Session | null` (Supabase session for persistence)
  - `currentList: SupabaseUserList | null`
  - `lists: SupabaseUserList[]`
  - `listItems: SupabaseUserListItem[]`
- **Functions:**
  - `signIn(email: string): Promise<void>`
  - `signOut(): Promise<void>`
  - `createList(name, description): Promise<void>`
  - `deleteList(id): Promise<void>` - Requires confirmation dialog
  - `setCurrentList(id): void`
  - `addItem(listId, itemId, priority, quantity): Promise<void>`
  - `removeItem(listItemId): Promise<void>` - Requires confirmation dialog
  - `updateItem(listItemId, priority, quantity): Promise<void>`
  - `togglePurchased(listItemId): Promise<void>`
  - `resetPurchasedItem(listItemId): Promise<void>` - Move from purchased to unpurchased

#### Context Integration Pattern

```typescript
// App.tsx context provider hierarchy
<ErrorBoundary>
  <LanguageProvider>
    <QueryClientProvider> {/* React Query */}
      <UserListProvider> {/* New: User auth and lists */}
        <Home />
      </UserListProvider>
    </QueryClientProvider>
  </LanguageProvider>
</ErrorBoundary>

// UserListProvider uses React Query internally for data fetching
// UserListContext provides domain-specific functions that wrap React Query hooks
```

#### Auth State Persistence

```typescript
// In UserListProvider or App initialization
useEffect(() => {
  // Check for existing session on mount
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

## User Flow

### First-Time User
1. User visits site
2. Sees master checklist (read-only)
3. Clicks "Login" button in top nav
4. Enters email address
5. Receives magic link email
6. Clicks link to authenticate
7. Redirected back to site (now logged in)
8. Clicks "My Lists" button
9. Creates first list via dialog
10. Selects items from master checklist to add to list

### Creating a Personal List
1. User clicks "My Lists" button
2. Sidebar opens showing all lists
3. User clicks "Create New List"
4. Dialog appears
5. User enters name and description
6. List is created and becomes current list

### Adding Items to List
1. User browses master checklist
2. Each item shows "Add to [List Name]" button
3. User clicks "Add"
4. Item selector expands showing priority and quantity controls
5. User adjusts settings
6. Item is added to current list

### Managing Shopping List
1. User clicks floating cart button (bottom-right)
2. Shopping list modal opens
3. All unpurchased items displayed, grouped by list
4. User clicks checkbox to mark item as purchased
5. Item moves to "Purchased" section
6. User can uncheck to move back to unpurchased

---

## Layout Changes

### Top Navigation Bar
```
[Existing: Language Switcher] [New: Auth Button] [New: My Lists Button]
```

### Main Content Area
```
┌─────────────────────────────────┐
│ 🌐 日本語 | 👤 email@example.com │ 📋 My Lists
├─────────────────────────────────┤
│                                  │
│  Current List: 待产包清单         │
│  [Edit] [Delete]                 │
│                                  │
│  Category: 孕产妇                 │
│  ┌────────────────────────────┐ │
│  │ Item A              [Add]  │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │ Item B  [Priority] [Qty]   │ │
│  │        [Required] [2]      │ │
│  │        [Remove]            │ │
│  └────────────────────────────┘ │
│                                  │
│  Category: 婴儿 0-3月            │
│  ...                             │
│                                  │
└─────────────────────────────────┘
                    [🛒 2]
```

### Sidebar Drawer (Left Slide-out)
```
┌──────────┬─────────────────────────┐
│          │ My Lists          [✕]  │
│  Slide  │─────────────────────────│
│  -out   │ ▶ 待产包清单 (12 items)  │
│  drawer │ ▶ 月子期清单 (8 items)   │
│          │ ▶ 宝宝用品清单 (15)     │
│          │                          │
│          │ [+ Create New List]     │
└──────────┴─────────────────────────┘
```

### Shopping List Modal
```
┌────────────────────────────────────┐
│ Shopping List              [✕]     │
├────────────────────────────────────┤
│ To Purchase (20)                   │
│────────────────────────────────────│
│ 待产包清单                          │
│   ☐ Item A (x2)                    │
│   ☐ Item B (x1)                    │
│                                    │
│ 月子期清单                          │
│   ☐ Item C (x3)                    │
│                                    │
│────────────────────────────────────│
│ Purchased (5)                      │
│────────────────────────────────────│
│   ☑ Item D (x1)  [Reset]          │
│   ☑ Item E (x2)  [Reset]          │
└────────────────────────────────────┘
```

### Floating Button Placement (Mobile Consideration)

**Desktop:** Bottom-right corner (20px from right, 20px from bottom)

**Mobile (> iOS Safari, Chrome Mobile compatibility):**
- **Option A:** Bottom-right but with safe area padding
  - `padding-bottom: env(safe-area-inset-bottom)`
  - Minimum 16px from bottom + safe area
- **Option B:** Fixed in top navigation bar instead
  - More consistent with mobile browser UI patterns
  - Avoids conflicts with mobile navigation bars

**Recommendation:** Use **Option A** with safe area padding and test on:
- iOS Safari (bottom toolbar)
- Chrome Android (bottom navigation bar)
- Samsung Internet browser

**Fallback:** If testing reveals conflicts, move to top navigation bar.

---

## Error Handling

### Authentication Errors
- **Invalid email:** Show validation error
- **Email sending failed:** Display error message with retry option
- **Magic link expired:** Prompt user to request new link
- **Session expired:** Automatically redirect to login

### Data Errors
- **Supabase connection failed:** Fall back to localStorage
- **List not found:** Show error and redirect to list selection
- **Item already in list:** Show message instead of adding duplicate
- **Concurrent update conflict:** Optimistic update with rollback on failure

### UI Errors
- **Empty list state:** Show friendly message + "Add items" CTA
- **Network timeout:** Show loading indicator + retry option
- **Permission denied:** Show "You don't have access" message

### Input Validation

**Email Validation:**
```typescript
const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email);
};
```
- Show error: "请输入有效的邮箱地址" / "Please enter a valid email"

**List Name Validation:**
```typescript
const validateListName = (name: string): { valid: boolean; error?: string } => {
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
```

**Quantity Validation:**
```typescript
const validateQuantity = (qty: number): boolean => {
  return qty >= VALIDATION_RULES.QUANTITY.MIN
    && qty <= VALIDATION_RULES.QUANTITY.MAX;
};
```
- Min: 1, Max: 99
- Show error: "数量必须在1-99之间"

### Mobile UX Guidelines

**Touch Interactions:**
- **Minimum touch target:** 44x44px (iOS HIG guideline)
- **Swipe gestures:**
  - Swipe right on sidebar: Close drawer
  - Swipe left on main content: Open drawer (optional)
- **Long press:** Show context menu for items (Edit, Remove)

**Sidebar Drawer on Mobile:**
- Full-screen width on small screens (< 640px)
- Overlay with backdrop
- Swipe to close support
- Back button closes drawer

**Shopping List Modal on Mobile:**
- Full-screen height
- Sticky header with close button
- Scrollable content area
- Larger checkboxes for touch (44x44px min)

**Responsive Breakpoints:**
- Mobile: < 640px (full-screen modals)
- Tablet: 640px - 1024px (centered modals, 90% max-width)
- Desktop: > 1024px (fixed-width modals, 600px)

---

## Performance Optimization

### React Query Strategy
```typescript
// User lists - cache 5 minutes
useQuery(['userLists'], fetchUserLists, {
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000
})

// List items - cache 5 minutes
useQuery(['listItems', listId], fetchListItems, {
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000
})

// Shopping list - cache 2 minutes (fresher data)
useQuery(['shoppingList'], fetchShoppingList, {
  staleTime: 2 * 60 * 1000,
  cacheTime: 5 * 60 * 1000
})
```

### Lazy Loading
- ListSidebar component: `React.lazy()`
- ShoppingListView component: `React.lazy()`
- AuthButton: load immediately (always visible)

### Optimistic Updates
- Add/remove item: Update UI immediately, sync in background
- Toggle purchased: Update immediately, sync on success
- Revert on failure with notification

### Offline Strategy and Loading States

**localStorage Fallback:**
```typescript
// When Supabase connection fails, sync to localStorage
const saveToLocal = (key: string, data: any) => {
  try {
    localStorage.setItem(`akachanlist_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('localStorage save failed:', e);
  }
};

// On app load, check for unsynced local changes
const loadFromLocal = (key: string) => {
  try {
    const data = localStorage.getItem(`akachanlist_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};
```

**Conflict Resolution:**
- Last-write-wins for simple conflicts
- Show user notification: "本地更改已同步" / "Local changes synced"
- Offline changes queue and sync when connection restored

**Loading States:**
- **Skeleton screens** for lists and items (gray placeholder boxes)
- **Spinners** for button actions (add, remove, update)
- **Progress indicators** for initial data load
- **Optimistic UI** updates with rollback on failure

**Network Status Detection:**
```typescript
// Listen for online/offline events
useEffect(() => {
  const handleOnline = () => {
    // Sync queued changes
    syncLocalChanges();
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}, []);
```

---

## Testing Strategy

### Unit Tests
- `AuthButton` component
- `ListSidebar` component
- `ShoppingListView` component
- `CreateListDialog` component
- `ListItemSelector` component
- `UserListContext` hooks
- Data transformation functions
- Auth utility functions

### Integration Tests
- Complete authentication flow
- Create/delete list operations
- Add/remove item operations
- Update item priority/quantity
- Toggle purchased status
- List switching
- Error handling and fallback

### E2E Tests (Playwright)
- New user onboarding journey
- Create list and add items
- Mark items as purchased
- Switch between lists
- Logout and login again
- Multi-language support

---

## Migration Plan

### Database Migration
```sql
-- Migration file: supabase/migrations/003_add_user_auth.sql
-- 1. Create user_lists table
-- 2. Create user_list_items table
-- 3. Create indexes
-- 4. Enable RLS
-- 5. Create RLS policies
```

### Code Migration
1. Install Supabase Auth client library (if not already installed)
2. Create new components folder: `src/components/user/`
3. Create context: `src/contexts/UserListContext.tsx`
4. Update `App.tsx` to include UserListProvider
5. Update `Home.tsx` to include new UI elements
6. Add TypeScript types for new data structures

---

## Phase 2 & 3 Features (Future)

### Phase 2
- List-level item notes
- Public list sharing via share_token
- Shared list read-only view
- Copy items from shared lists

### Phase 3
- Global item notes (across all lists)
- Consumable item tracking (repeat purchases)
- Purchase history
- List templates
- Export/import lists

---

## Dependencies

### New npm packages
```json
{
  "@supabase/supabase-js": "latest", // Already installed
  "@tanstack/react-query": "latest"  // Already installed
}
```

No additional dependencies required - will use existing Supabase and React Query setup.

---

## Success Criteria

Phase 1 is successful when:
- ✅ Users can authenticate via magic link
- ✅ Users can create multiple personal lists
- ✅ Users can add items from master list with priority/quantity
- ✅ Users can view unified shopping list
- ✅ Users can mark items as purchased/unpurchased
- ✅ All features work in both Chinese and Japanese
- ✅ Application gracefully handles auth and data errors
- ✅ Responsive design works on mobile and desktop

---

## Open Questions

None at this time.

---

## Appendix: Data Types

### TypeScript Type Definitions

```typescript
// Extend existing types in src/types/index.ts

// Supabase auth user type
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

// User list - aligns with Supabase naming convention
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

// User list item with item details joined
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

// Enriched user list with item count
export interface UserListWithStats extends SupabaseUserList {
  total_items: number;
  purchased_items: number;
}

// Shopping list item grouped by list
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
    PATTERN: /^[^<>{}$]*$/, // No special characters
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
