import { supabase } from '../lib/supabase';
import { ItemsData, Category, Subcategory, Item, Language, SupabaseProjectResponse } from '../types';

export async function loadItemsData(): Promise<ItemsData> {
  const response = await fetch('/data/items.json');
  if (!response.ok) {
    throw new Error('Failed to load items data');
  }
  return response.json();
}

export function getPriorityLabel(priority: string): string {
  return priority === 'required' ? '必需' : '推荐';
}

export function getPriorityColor(priority: string): string {
  return priority === 'required' ? 'bg-blue-500' : 'bg-green-500';
}

function transformItem(rawItem: any, lang: Language): Item {
  return {
    name: rawItem[`name_${lang}`] || rawItem.name_zh,
    priority: rawItem.priority,
    description: rawItem[`description_${lang}`] || rawItem.description_zh,
    quantity: rawItem[`quantity_${lang}`] || rawItem.quantity_zh,
    notes: rawItem[`notes_${lang}`] || rawItem.notes_zh,
  };
}

function transformSubcategory(
  rawSub: any,
  lang: Language
): Subcategory {
  return {
    id: rawSub.slug,
    title: rawSub[`name_${lang}`] || rawSub.name_zh,
    description: rawSub[`description_${lang}`] || rawSub.description_zh,
    items: rawSub.items.map((item: any) => transformItem(item, lang)),
  };
}

function transformCategory(rawCat: any, lang: Language): Category {
  return {
    id: rawCat.slug,
    title: rawCat[`name_${lang}`] || rawCat.name_zh,
    icon: rawCat.icon,
    subcategories: rawCat.subcategories.map((sub: any) =>
      transformSubcategory(sub, lang)
    ),
  };
}

export function transformData(
  rawData: SupabaseProjectResponse,
  lang: Language
): ItemsData {
  return {
    meta: {
      title: rawData[`name_${lang}`] || rawData.name_zh,
      subtitle: rawData[`description_${lang}`] || rawData.description_zh,
      lastUpdated: new Date().toISOString().split('T')[0],
    },
    categories: rawData.categories.map((cat) => transformCategory(cat, lang)),
  };
}

export async function fetchProjectData(
  projectSlug: string,
  lang: Language
): Promise<ItemsData> {
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

  if (error) throw error;
  return transformData(data as SupabaseProjectResponse, lang);
}

export async function fetchLocalData(lang: Language): Promise<ItemsData> {
  const response = await fetch(`/data/items-${lang}.json`);
  if (!response.ok) throw new Error('Failed to load local data');
  return response.json();
}
