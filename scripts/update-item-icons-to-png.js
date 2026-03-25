import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 分类到 PNG 图标的映射
const categoryIconMap = {
  'maternity-mama': '/icons/maternity-mama.png',
  'baby-0-3m': '/icons/baby-wear.png',
  'baby-3-6m': '/icons/baby-wear.png',
  'outing': '/icons/odekake.png',
  'sleep': '/icons/nenne-oheya.png',
  'bath-care': '/icons/ofuro-baby-care.png',
  'toilet-training': '/icons/omutu-kaeta.png',
  'memorial': '/icons/memorial-ceremony.png',
  'hospital': '/icons/junnyu-cho-nyu.png',
  'postpartum': '/icons/junnyu-cho-nyu.png'
};

// 读取 JSON 文件
const dataPath = path.join(__dirname, '../public/data/items-zh.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let updatedCount = 0;
let totalItems = 0;

// 遍历所有分类
data.categories.forEach(category => {
  const categoryIcon = categoryIconMap[category.id] || '/icons/maternity-mama.png';

  // 遍历所有子分类
  category.subcategories.forEach(subcategory => {
    // 遍历所有商品
    subcategory.items.forEach(item => {
      totalItems++;

      // 更新 icon 字段
      const oldIcon = item.icon;
      item.icon = categoryIcon;

      if (oldIcon !== categoryIcon) {
        updatedCount++;
        console.log(`Updated: ${item.name}`);
        console.log(`  Old: ${oldIcon}`);
        console.log(`  New: ${categoryIcon}`);
      }
    });
  });
});

// 保存更新后的文件
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✅ 完成！`);
console.log(`📊 总计: ${totalItems} 个商品`);
console.log(`🔄 更新: ${updatedCount} 个商品`);
console.log(`📁 文件: ${dataPath}`);
