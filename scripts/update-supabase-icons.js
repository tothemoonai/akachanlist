import { createClient } from '@supabase/supabase-js';

// Supabase 配置 - 从环境变量读取
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_SERVICE_ROLE_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 分类到 PNG 图标的映射
const categoryIconMap = {
  'maternity-mama': '/icons/maternity-mama.png',
  'baby-0-3m': '/icons/baby-wear.png',
  'baby-3-6m': '/icons/baby-wear.png',
  'outing': '/icons/odekake.png',
  'sleep': '/icons/nenne-oheya.png',
  'bath-care': '/icons/ofuro-baby-care.png',
  'toilet-training': '/icons/omutu-kaeta.png',
  'memorial': '/icons/memorial-ceremony.png'
};

async function updateIcons() {
  console.log('🔄 开始更新 Supabase 数据库中的商品图标...\n');

  try {
    // 获取所有分类
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, slug');

    if (categoriesError) {
      console.error('❌ 获取分类失败:', categoriesError);
      return;
    }

    console.log(`✅ 找到 ${categories.length} 个分类\n`);

    let totalUpdated = 0;

    // 遍历每个分类
    for (const category of categories) {
      const iconPath = categoryIconMap[category.slug];

      if (!iconPath) {
        console.log(`⏭️  跳过分类: ${category.slug} (无映射)`);
        continue;
      }

      // 获取该分类下的所有子分类 ID
      const { data: subcategories, error: subError } = await supabase
        .from('subcategories')
        .select('id')
        .eq('category_id', category.id);

      if (subError) {
        console.error(`❌ 获取 ${category.slug} 的子分类失败:`, subError);
        continue;
      }

      const subcategoryIds = subcategories.map(sub => sub.id);

      if (subcategoryIds.length === 0) {
        console.log(`⏭️  跳过分类: ${category.slug} (无子分类)`);
        continue;
      }

      // 先获取该分类下的商品数量
      const { count: beforeCount, error: countError } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .in('subcategory_id', subcategoryIds);

      if (countError) {
        console.error(`❌ 获取 ${category.slug} 的商品数量失败:`, countError);
        continue;
      }

      // 更新该分类下所有商品的图标
      const { error: updateError } = await supabase
        .from('items')
        .update({ icon: iconPath })
        .in('subcategory_id', subcategoryIds);

      if (updateError) {
        console.error(`❌ 更新 ${category.slug} 的商品图标失败:`, updateError);
        continue;
      }

      totalUpdated += beforeCount || 0;
      console.log(`✅ ${category.slug}: 更新了 ${beforeCount} 个商品 → ${iconPath}`);
    }

    console.log(`\n🎉 完成！总共更新了 ${totalUpdated} 个商品的图标`);

  } catch (error) {
    console.error('❌ 发生错误:', error);
  }
}

updateIcons();
