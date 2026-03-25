import { createClient } from '@supabase/supabase-js';
import { Review, ReviewFilters } from '../types/reviews';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client using 2025 publishable key format
// VITE_SUPABASE_ANON_KEY should be a publishable key: sb_publishable_...
// Old anon key format (eyJ...) is deprecated
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function getReviews(filters: ReviewFilters = {}) {
  if (!supabase) throw new Error('Supabase client not initialized');

  let query = supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.featured) {
    query = query.eq('featured', true);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { reviews: data || [], count };
}

export async function getReviewBySlug(slug: string) {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function getReviewsByItemId(itemId: string) {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('item_id', itemId)
    .eq('status', 'published');

  if (error) throw error;
  return data || [];
}

export async function createReview(review: Partial<Review>) {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReview(id: string, review: Partial<Review>) {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('reviews')
    .update(review)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReview(id: string) {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadReviewImage(file: File) {
  if (!supabase) throw new Error('Supabase client not initialized');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `reviews/${fileName}`;

  const { data, error } = await supabase.storage
    .from('review-images')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('review-images')
    .getPublicUrl(filePath);

  return publicUrl;
}