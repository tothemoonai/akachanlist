import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从 .env.local 加载环境变量
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key] = valueParts.join('=').trim();
    }
  });
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// 分类图标映射
const categoryIconMap = {
  'maternity-mama': '/icons/icon__nav_category_1.gif',
  'baby-0-3m': '/icons/icon__nav_category_3.gif',
  'baby-3-6m': '/icons/icon__nav_category_3.gif',
  'outing': '/icons/icon__nav_category_2.gif'
};

async function updateCategoryIcons() {
  console.log('🔄 更新 Supabase 数据库中的分类图标...\n');

  try {
    // 获取所有分类
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, slug, name_zh, icon');

    if (error) {
      console.error('❌ 获取分类失败:', error);
      return;
    }

    console.log(`✅ 找到 ${categories.length} 个分类\n`);

    let updated = 0;

    // 更新每个分类的图标
    for (const category of categories) {
      const newIcon = categoryIconMap[category.slug];

      if (!newIcon) {
        console.log(`⏭️  跳过: ${category.name_zh} (无映射)`);
        continue;
      }

      if (category.icon === newIcon) {
        console.log(`✓ 已是最新: ${category.name_zh}`);
        continue;
      }

      // 更新图标
      const { error: updateError } = await supabase
        .from('categories')
        .update({ icon: newIcon })
        .eq('id', category.id);

      if (updateError) {
        console.error(`❌ 更新失败: ${category.name_zh}`, updateError);
        continue;
      }

      updated++;
      console.log(`✅ [${updated}] ${category.name_zh}`);
      console.log(`   ${category.icon}`);
      console.log(`   → ${newIcon}\n`);
    }

    console.log(`\n🎉 完成！更新了 ${updated} 个分类的图标`);

  } catch (error) {
    console.error('❌ 发生错误:', error);
  }
}

updateCategoryIcons();
