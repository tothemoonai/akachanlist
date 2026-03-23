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
- Login/logout UI in top navigation bar

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
- **Behavior:**
  - Modal overlay
  - Group items by parent list
  - Toggle purchased status
  - Show quantity controls
  - Reset consumable items

#### `CreateListDialog.tsx`
- **Purpose:** Create new user list
- **Props:**
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onCreate: (name: string, description?: string) => void`
- **State:**
  - `name: string`
  - `description: string`
- **Behavior:**
  - Modal dialog form
  - Validate name not empty
  - Submit creates new list

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
  - `user: User | null` (from Supabase Auth)
  - `currentList: UserList | null`
  - `lists: UserList[]`
  - `listItems: UserListItem[]`
- **Functions:**
  - `signIn(email: string): Promise<void>`
  - `signOut(): Promise<void>`
  - `createList(name, description): Promise<void>`
  - `deleteList(id): Promise<void>`
  - `setCurrentList(id): void`
  - `addItem(listId, itemId, priority, quantity): Promise<void>`
  - `removeItem(listItemId): Promise<void>`
  - `updateItem(listItemId, priority, quantity): Promise<void>`
  - `togglePurchased(listItemId): Promise<void>`

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

```typescript
interface UserList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  share_token?: string;
  created_at: string;
  updated_at: string;
}

interface UserListItem {
  id: string;
  user_list_id: string;
  item_id: string;
  priority: 'required' | 'recommended' | 'optional';
  quantity: number;
  is_purchased: boolean;
  purchased_at?: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
}
```
