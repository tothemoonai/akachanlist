import { supabase } from '../lib/supabase';
import {
  ItemsData,
  Category,
  Subcategory,
  Item,
  Language,
  SupabaseProjectResponse,
  SupabaseItem,
  SupabaseSubcategory,
  SupabaseCategory
} from '../types';

const LOCAL_DATA_PATH_TEMPLATE = '/data/items-{lang}.json';

/**
 * Loads items data from the default local JSON file
 * @returns Promise resolving to ItemsData
 * @throws Error if fetch fails or response is not OK
 */
export async function loadItemsData(): Promise<ItemsData> {
  const response = await fetch('/data/items.json');
  if (!response.ok) {
    throw new Error('Failed to load items data');
  }
  return response.json();
}

/**
 * Gets the localized label for a priority level
 * @param priority - The priority value ('required' | 'recommended')
 * @returns Localized priority label
 */
export function getPriorityLabel(priority: string): string {
  return priority === 'required' ? '必需' : '推荐';
}

/**
 * Gets the CSS color class for a priority level
 * @param priority - The priority value ('required' | 'recommended')
 * @returns CSS color class string
 */
export function getPriorityColor(priority: string): string {
  return priority === 'required' ? 'bg-blue-500' : 'bg-green-500';
}

/**
 * Transforms a raw Supabase item into the application Item format
 * @param rawItem - Raw item data from Supabase
 * @param lang - Target language for localization
 * @returns Transformed Item with null safety checks
 * @throws Error if required fields (name, priority) are missing
 */
function transformItem(rawItem: SupabaseItem, lang: Language): Item {
  // Validate required fields
  if (!rawItem.name_zh && !rawItem.name_ja) {
    throw new Error('Item must have at least one localized name (name_zh or name_ja)');
  }
  if (!rawItem.priority) {
    throw new Error(`Item is missing required priority field`);
  }

  // Get localized values with null safety
  const name = rawItem[`name_${lang}`] || rawItem.name_zh || '';
  const description = rawItem[`description_${lang}`] || rawItem.description_zh;
  const quantity = rawItem[`quantity_${lang}`] || rawItem.quantity_zh;
  const notes = rawItem[`notes_${lang}`] || rawItem.notes_zh;

  return {
    id: rawItem.id, // Preserve Supabase UUID
    name,
    priority: rawItem.priority,
    description,
    quantity,
    notes,
  };
}

/**
 * Transforms a raw Supabase subcategory into the application Subcategory format
 * @param rawSub - Raw subcategory data from Supabase
 * @param lang - Target language for localization
 * @returns Transformed Subcategory
 * @throws Error if required fields are missing or items array is invalid
 */
function transformSubcategory(
  rawSub: SupabaseSubcategory,
  lang: Language
): Subcategory {
  if (!rawSub.slug) {
    throw new Error('Subcategory must have a slug');
  }
  if (!Array.isArray(rawSub.items)) {
    throw new Error(`Subcategory "${rawSub.slug}" must have an items array`);
  }

  return {
    id: rawSub.slug,
    title: rawSub[`name_${lang}`] || rawSub.name_zh || rawSub.slug,
    description: rawSub[`description_${lang}`] || rawSub.description_zh,
    items: rawSub.items.map((item: SupabaseItem) => transformItem(item, lang)),
  };
}

/**
 * Transforms a raw Supabase category into the application Category format
 * @param rawCat - Raw category data from Supabase
 * @param lang - Target language for localization
 * @returns Transformed Category
 * @throws Error if required fields are missing or subcategories array is invalid
 */
function transformCategory(rawCat: SupabaseCategory, lang: Language): Category {
  if (!rawCat.slug) {
    throw new Error('Category must have a slug');
  }
  if (!rawCat.icon) {
    throw new Error(`Category "${rawCat.slug}" must have an icon`);
  }
  if (!Array.isArray(rawCat.subcategories)) {
    throw new Error(`Category "${rawCat.slug}" must have a subcategories array`);
  }

  return {
    id: rawCat.slug,
    title: rawCat[`name_${lang}`] || rawCat.name_zh || rawCat.slug,
    icon: rawCat.icon,
    subcategories: rawCat.subcategories.map((sub: SupabaseSubcategory) =>
      transformSubcategory(sub, lang)
    ),
  };
}

/**
 * Transforms raw Supabase project response into the application ItemsData format
 * @param rawData - Raw project data from Supabase
 * @param lang - Target language for localization
 * @returns Transformed ItemsData
 * @throws Error if required fields are missing or categories array is invalid
 */
export function transformData(
  rawData: SupabaseProjectResponse,
  lang: Language
): ItemsData {
  if (!rawData.name_zh && !rawData.name_ja) {
    throw new Error('Project must have at least one localized name (name_zh or name_ja)');
  }
  if (!Array.isArray(rawData.categories)) {
    throw new Error('Project must have a categories array');
  }

  return {
    meta: {
      title: rawData[`name_${lang}`] || rawData.name_zh || '',
      subtitle: rawData[`description_${lang}`] || rawData.description_zh || '',
      lastUpdated: new Date().toISOString().split('T')[0],
    },
    categories: rawData.categories.map((cat: SupabaseCategory) => transformCategory(cat, lang)),
  };
}

/**
 * Fetches project data from Supabase and transforms it
 * @param projectSlug - The unique slug identifier for the project
 * @param lang - Target language for localization
 * @returns Promise resolving to ItemsData
 * @throws Error with context if fetch fails or data is invalid
 */
export async function fetchProjectData(
  projectSlug: string,
  lang: Language
): Promise<ItemsData> {
  // Check if Supabase is configured
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      slug,
      name_zh,
      name_ja,
      description_zh,
      description_ja,
      categories (
        id,
        slug,
        name_zh,
        name_ja,
        icon,
        sort_order,
        subcategories (
          id,
          slug,
          name_zh,
          name_ja,
          description_zh,
          description_ja,
          sort_order,
          items (
            id,
            name_zh,
            name_ja,
            description_zh,
            description_ja,
            priority,
            quantity_zh,
            quantity_ja,
            notes_zh,
            notes_ja,
            sort_order
          )
        )
      )
    `)
    .eq('slug', projectSlug)
    .order('sort_order', { referencedTable: 'categories' })
    .order('sort_order', { referencedTable: 'subcategories' })
    .order('sort_order', { referencedTable: 'items' })
    .single();

  if (error) {
    throw new Error(`Failed to fetch project data for slug "${projectSlug}": ${error.message}`);
  }

  // Defensive runtime validation before type assertion
  if (!data || typeof data !== 'object') {
    throw new Error(`Invalid project data received for slug "${projectSlug}"`);
  }

  if (!Array.isArray((data as any).categories)) {
    throw new Error(`Project data for slug "${projectSlug}" is missing categories array`);
  }

  return transformData(data as SupabaseProjectResponse, lang);
}

/**
 * Fetches localized items data from local JSON file
 * @param lang - Target language for data file
 * @returns Promise resolving to ItemsData
 * @throws Error if fetch fails or response is not OK
 */
export async function fetchLocalData(lang: Language): Promise<ItemsData> {
  const dataPath = LOCAL_DATA_PATH_TEMPLATE.replace('{lang}', lang);
  const response = await fetch(dataPath);

  if (!response.ok) {
    throw new Error(`Failed to load local data for language "${lang}" from ${dataPath}`);
  }

  return response.json();
}
