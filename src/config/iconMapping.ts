/**
 * Icon mapping configuration for akachan.jp categories
 * Maps category slugs to their corresponding icon files
 */

export interface IconMapping {
  slug: string;
  nameZh: string;
  nameJa: string;
  iconFile: string;
  lucideIcon?: string; // Fallback to lucide-react icon
}

export const categoryIconMapping: IconMapping[] = [
  {
    slug: 'maternity-mama',
    nameZh: '孕妇用品',
    nameJa: 'マタニティ＆ママ',
    iconFile: '/icons/maternity-mama.png',
    lucideIcon: 'baby'
  },
  {
    slug: 'odekake',
    nameZh: '外出用品',
    nameJa: 'おでかけ',
    iconFile: '/icons/odekake.png',
    lucideIcon: 'shoppingBag'
  },
  {
    slug: 'baby-wear',
    nameZh: '婴儿服装',
    nameJa: 'ベビーウェア',
    iconFile: '/icons/baby-wear.png',
    lucideIcon: 'shirt'
  },
  {
    slug: 'nenne-oheya',
    nameZh: '睡眠用品',
    nameJa: 'ねんね・おへや',
    iconFile: '/icons/nenne-oheya.png',
    lucideIcon: 'bed'
  },
  {
    slug: 'junnyu-cho-nyu',
    nameZh: '授乳用品',
    nameJa: '授乳・調乳',
    iconFile: '/icons/junnyu-cho-nyu.png',
    lucideIcon: 'package'
  },
  {
    slug: 'omutu-kaeta',
    nameZh: '尿布更换',
    nameJa: 'おむつ替え・お洗濯',
    iconFile: '/icons/omutu-kaeta.png',
    lucideIcon: 'package'
  },
  {
    slug: 'ofuro-baby-care',
    nameZh: '沐浴护理',
    nameJa: 'おふろ・ベビーケア',
    iconFile: '/icons/ofuro-baby-care.png',
    lucideIcon: 'droplets'
  },
  {
    slug: 'memorial-ceremony',
    nameZh: '纪念仪式',
    nameJa: 'メモリアル・セレモニー',
    iconFile: '/icons/memorial-ceremony.png',
    lucideIcon: 'heart'
  }
];

/**
 * Get icon file path for a category slug
 */
export function getIconForCategory(slug: string): string | undefined {
  const mapping = categoryIconMapping.find(m => m.slug === slug);
  return mapping?.iconFile;
}

/**
 * Get all icon mappings
 */
export function getAllIconMappings(): IconMapping[] {
  return categoryIconMapping;
}
