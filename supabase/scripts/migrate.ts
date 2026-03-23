import { createClient } from '@supabase/supabase-js';
import itemsZh from '../../public/data/items-zh.json';
import itemsJa from '../../public/data/items-ja.json';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; // Service role key for full access

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase credentials. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Main migration function
async function migrateData() {
  console.log('Starting data migration to Supabase...\n');

  try {
    // 1. Create project
    console.log('1. Creating project...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        slug: 'akachanlist',
        name_zh: itemsZh.meta.title,
        name_ja: itemsJa.meta.title,
        description_zh: itemsZh.meta.subtitle,
        description_ja: itemsJa.meta.subtitle
      })
      .select()
      .single();

    if (projectError) throw projectError;
    console.log(`   ✓ Project created: ${project.id}\n`);

    // 2. Create categories and subcategories
    console.log('2. Creating categories and subcategories...');
    const categoryMap = new Map<string, string>(); // categoryId -> UUID
    const subcategoryMap = new Map<string, string>(); // subcategoryId -> UUID

    for (const category of itemsZh.categories) {
      // Create category
      const { data: cat, error: catError } = await supabase
        .from('categories')
        .insert({
          project_id: project.id,
          slug: category.id,
          name_zh: category.title,
          name_ja: itemsJa.categories.find(c => c.id === category.id)?.title || category.title,
          icon: category.icon,
          sort_order: itemsZh.categories.indexOf(category)
        })
        .select()
        .single();

      if (catError) throw catError;
      categoryMap.set(category.id, cat.id);
      console.log(`   ✓ Category: ${cat.name_zh}`);

      // Create subcategories
      for (const subcategory of category.subcategories) {
        const jaSubcategory = itemsJa.categories
          .find(c => c.id === category.id)
          ?.subcategories.find(s => s.id === subcategory.id);

        const { data: sub, error: subError } = await supabase
          .from('subcategories')
          .insert({
            category_id: cat.id,
            slug: subcategory.id,
            name_zh: subcategory.title,
            name_ja: jaSubcategory?.title || subcategory.title,
            description_zh: subcategory.description,
            description_ja: jaSubcategory?.description,
            sort_order: category.subcategories.indexOf(subcategory)
          })
          .select()
          .single();

        if (subError) throw subError;
        subcategoryMap.set(subcategory.id, sub.id);
        console.log(`      ✓ Subcategory: ${sub.name_zh}`);

        // Create items
        console.log(`         Adding items...`);
        for (const item of subcategory.items) {
          const jaItem = jaSubcategory?.items.find(i => i.name === item.name);

          const { error: itemError } = await supabase
            .from('items')
            .insert({
              subcategory_id: sub.id,
              name_zh: item.name,
              name_ja: jaItem?.name || item.name,
              description_zh: item.description,
              description_ja: jaItem?.description,
              priority: item.priority,
              quantity_zh: item.quantity,
              quantity_ja: jaItem?.quantity,
              notes_zh: item.notes,
              notes_ja: jaItem?.notes,
              sort_order: subcategory.items.indexOf(item)
            });

          if (itemError) throw itemError;
        }
        console.log(`         ✓ ${subcategory.items.length} items`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- 1 project`);
    console.log(`- ${itemsZh.categories.length} categories`);
    console.log(`- ${categoryMap.size} subcategories`);
    console.log(`- Items: ${itemsZh.categories.reduce((sum, cat) =>
      sum + cat.subcategories.reduce((s, sub) => s + sub.items.length, 0), 0
    )} total`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();
