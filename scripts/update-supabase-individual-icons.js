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
      const value = valueParts.join('=').trim();
      process.env[key] = value;
    }
  });
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function updateItemIcons() {
  console.log('🔄 更新 Supabase 数据库中的商品图标...\n');

  try {
    // 读取映射文件
    const mappingPath = path.join(__dirname, '../public/icons/item-icon-map.json');
    const iconMap = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

    console.log(`✅ 读取了 ${Object.keys(iconMap).length} 个图标映射\n`);

    let updated = 0;
    let notFound = 0;

    // 遍历映射，更新数据库
    for (const [itemName, iconPath] of Object.entries(iconMap)) {
      // 查找匹配的商品（通过中文名称）
      const { data: items, error } = await supabase
        .from('items')
        .select('id, name_zh, icon')
        .eq('name_zh', itemName);

      if (error) {
        console.error(`❌ 查询失败: ${itemName}`, error);
        continue;
      }

      if (!items || items.length === 0) {
        notFound++;
        console.log(`⚠️  未找到商品: ${itemName}`);
        continue;
      }

      // 更新图标
      const { error: updateError } = await supabase
        .from('items')
        .update({ icon: iconPath })
        .eq('id', items[0].id);

      if (updateError) {
        console.error(`❌ 更新失败: ${itemName}`, updateError);
        continue;
      }

      updated++;
      console.log(`✅ [${updated}/${Object.keys(iconMap).length}] ${itemName}`);
      console.log(`   ${items[0].icon} → ${iconPath}`);
    }

    console.log(`\n📊 统计:`);
    console.log(`   ✅ 更新成功: ${updated}`);
    console.log(`   ⚠️  未找到: ${notFound}`);

  } catch (error) {
    console.error('❌ 发生错误:', error);
  }
}

updateItemIcons();
