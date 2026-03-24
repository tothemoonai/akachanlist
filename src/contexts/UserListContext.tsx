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
  updateUserNotes: (listItemId: string, notes: string) => Promise<void>;
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
        .select('*')
        .eq('user_list_id', currentList.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch item details separately
      const listItemIds = data.map(li => li.item_id);
      const uniqueItemIds = [...new Set(listItemIds)];

      if (uniqueItemIds.length === 0) {
        return data as SupabaseUserListItem[];
      }

      const { data: itemsData } = await supabase
        .from('items')
        .select('id, name_zh, name_ja, description_zh, description_ja, priority')
        .in('id', uniqueItemIds);

      // Merge item details into list items
      return data.map(li => ({
        ...li,
        item: itemsData?.find(item => item.id === li.item_id) || null
      })) as SupabaseUserListItem[];
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
          throw new Error('该物品已在清单中 / This item is already in the list');
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
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
    },
  });

  // Update user notes mutation
  const updateUserNotesMutation = useMutation({
    mutationFn: async ({ listItemId, notes }: { listItemId: string; notes: string }) => {
      if (!supabase) throw new Error('Supabase not configured');

      const { error } = await supabase
        .from('user_list_items')
        .update({ user_notes: notes })
        .eq('id', listItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listItems'] });
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
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
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
    },
  });

  // Reset purchased item mutation
  const resetPurchasedMutation = useMutation({
    mutationFn: async (listItemId: string) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase
        .from('user_list_items')
        .update({
          is_purchased: false,
          purchased_at: null,
        })
        .eq('id', listItemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listItems'] });
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
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

  const updateUserNotes = useCallback(async (listItemId: string, notes: string) => {
    await updateUserNotesMutation.mutateAsync({ listItemId, notes });
  }, [updateUserNotesMutation]);

  const togglePurchased = useCallback(async (listItemId: string) => {
    await togglePurchasedMutation.mutateAsync(listItemId);
  }, [togglePurchasedMutation]);

  const resetPurchasedItem = useCallback(async (listItemId: string) => {
    await resetPurchasedMutation.mutateAsync(listItemId);
  }, [resetPurchasedMutation]);

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
        updateUserNotes,
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
