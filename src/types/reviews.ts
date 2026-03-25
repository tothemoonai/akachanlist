// src/types/reviews.ts

export interface Review {
  id: string;
  user_id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  author_name?: string;
  author_avatar?: string;

  // 商品关联
  category?: string;
  category_id?: string;
  subcategory_id?: string;
  item_name?: string;
  item_id?: string;

  // SEO metadata
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];

  // 元数据
  rating?: number;
  source_url?: string;
  source_site?: string;

  // 统计
  view_count?: number;
  like_count?: number;

  // 状态
  status: 'draft' | 'published' | 'archived';
  featured: boolean;

  // 时间戳
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface ReviewCard extends Review {
  excerpt?: string;
}

export interface ReviewFilters {
  status?: 'published' | 'draft' | 'all';
  featured?: boolean;
  category?: string;
  search?: string;
  sortBy?: 'latest' | 'rating' | 'title';
  limit?: number;
  offset?: number;
}

export interface ReviewFormData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  author_name?: string;
  author_avatar?: string;
  category?: string;
  category_id?: string;
  subcategory_id?: string;
  item_name?: string;
  item_id?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  rating?: number;
  source_url?: string;
  source_site?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  published_at?: string;
}
