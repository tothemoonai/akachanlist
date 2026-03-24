import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = 'https://wnyrinifinvgagbtlpwb.supabase.co';
const supabaseKey = 'sb_publishable_LCbzioQaM2XTyJZWDHBTLw_OUEbwM5_';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('🔍 检查 Supabase 数据库...\n');

  try {
    // 检查项目
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*');

    if (projectError) {
      console.error('❌ 获取项目失败:', projectError);
    } else {
      console.log(`✅ 项目数量: ${projects.length}`);
      projects.forEach(p => console.log(`   - ${p.slug} (${p.name_zh})`));
    }

    // 检查分类
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('❌ 获取分类失败:', categoriesError);
    } else {
      console.log(`\n✅ 分类数量: ${categories.length}`);
      categories.forEach(c => console.log(`   - ${c.slug} (${c.name_zh})`));
    }

    // 检查子分类
    const { data: subcategories, error: subError } = await supabase
      .from('subcategories')
      .select('*');

    if (subError) {
      console.error('❌ 获取子分类失败:', subError);
    } else {
      console.log(`\n✅ 子分类数量: ${subcategories.length}`);
    }

    // 检查商品
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*');

    if (itemsError) {
      console.error('❌ 获取商品失败:', itemsError);
    } else {
      console.log(`\n✅ 商品数量: ${items.length}`);
      if (items.length > 0) {
        console.log('   前 5 个商品:');
        items.slice(0, 5).forEach(item => {
          console.log(`   - ${item.name_zh} (icon: ${item.icon || 'null'})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ 发生错误:', error);
  }
}

checkData();
