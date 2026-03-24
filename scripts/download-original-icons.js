import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 图标输出目录
const iconsDir = path.join(__dirname, '../public/icons/items');

async function downloadIcon(url, filepath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return false;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filepath, buffer);
    return true;
  } catch (error) {
    return false;
  }
}

async function extractAndDownloadIcons() {
  console.log('🔄 从原始数据提取并下载图标...\n');

  // 读取原始 JSON 数据（从 Git 提取的版本）
  const dataPath = path.join(__dirname, '../items-zh-original.json');
  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // 创建输出目录
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const iconMap = new Map(); // 存储商品名 -> 图标 URL 的映射

  // 遍历所有分类
  rawData.categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.items.forEach(item => {
        if (item.icon && item.icon.startsWith('https://')) {
          // 保存图标 URL
          iconMap.set(item.name, item.icon);
        }
      });
    });
  });

  console.log(`✅ 找到 ${iconMap.size} 个商品图标 URL\n`);

  if (iconMap.size === 0) {
    console.log('❌ 没有找到 HTTPS 图标 URL');
    return;
  }

  let downloaded = 0;
  let failed = 0;

  // 下载所有图标
  for (const [itemName, iconUrl] of iconMap.entries()) {
    // 生成安全的文件名
    const safeName = itemName
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    const filename = `${safeName}.gif`;
    const filepath = path.join(iconsDir, filename);

    console.log(`⬇️  [${downloaded + failed + 1}/${iconMap.size}] ${itemName}`);

    const success = await downloadIcon(iconUrl, filepath);

    if (success) {
      downloaded++;
      console.log(`   ✅ ${filename}`);
    } else {
      failed++;
      console.log(`   ❌ 失败 (防盗链或URL无效)`);
    }

    // 添加小延时
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n📊 统计:`);
  console.log(`   ✅ 成功: ${downloaded}/${iconMap.size}`);
  console.log(`   ❌ 失败: ${failed}/${iconMap.size}`);
  console.log(`\n📁 图标保存在: ${iconsDir}`);

  // 生成映射文件
  const mappingPath = path.join(__dirname, '../public/icons/item-icon-map.json');
  const mapping = {};

  for (const [itemName, iconUrl] of iconMap.entries()) {
    const safeName = itemName
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    mapping[itemName] = `/icons/items/${safeName}.gif`;
  }

  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2), 'utf8');
  console.log(`\n📝 映射文件: ${mappingPath}`);
}

extractAndDownloadIcons();
