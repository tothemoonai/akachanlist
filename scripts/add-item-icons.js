import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 图标映射规则 - 根据产品关键词匹配图标
const iconMapping = {
  // 药品/补充剂
  'pill': ['补充剂', '叶酸', '铁', '钙', '药', 'サプリ'],
  'thermometer': ['体温计', '温度計'],
  'heart': ['产妇', '孕妇', 'マタニティ', '授乳', '哺乳', '产后', '産後'],

  // 衣物
  'shirt': ['服', '内衣', '睡衣', '连体衣', '连衣裙', '短内衣', '长内衣', 'ショーツ', 'ブラジャー', 'キャミソール', 'タンクトップ', 'ウェア', 'レギンス', 'ストッキング', 'タイツ'],
  'baby': ['婴儿', '赤ちゃん', 'ベビー'],

  // 护理用品
  'droplets': ['沐浴露', '洗发水', '护理霜', '乳液', 'クリーム', 'ローション', 'シャンプー'],
  'package': ['纸尿裤', '尿布', 'おむつ', '湿巾', '护臀膏', '产褥垫', '防溢乳垫', '哺乳瓶', '奶瓶', '奶嘴', '乳首'],

  // 寝具
  'bed': ['床', '床垫', '床品', '睡袋', '枕', '抱枕', 'クッション', '布団', 'シーツ', 'マットレス'],

  // 外出
  'car': ['安全座椅', 'チャイルドシート', '婴儿车', 'ベビーカー', 'カー', '車'],
  'shoppingBag': ['包', 'バッグ', 'ケース', '母子手帐', '母子手帳'],

  // 食物/喂养
  'coffee': ['奶粉', 'ミルク', '哺乳', '授乳'],
  'cup': ['杯', '吸管杯', 'ストロー', 'カップ'],

  // 玩具
  'star': ['玩具', 'おもちゃ', '摇铃', '布书', '健身架', 'がらがら', '絵本', 'ジム'],

  // 浴室
  'bath': ['浴盆', '澡盆', 'バス', 'おふろ'],
  'home': ['房间', '部屋', 'おへや'],

  // 其他
  'clock': ['钟', '時計'],
  'calendar': ['日历', 'カレンダー'],
  'book': ['手册', '手帳', '本'],
  'sun': ['帽子', '帽子', 'UV', '紫外线'],
};

// 默认图标
const defaultIcon = 'package';

// 根据产品名称获取图标
function getIconForItem(itemName, itemDescription) {
  const text = (itemName + ' ' + (itemDescription || '')).toLowerCase();

  // 遍历所有图标映射
  for (const [icon, keywords] of Object.entries(iconMapping)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase()) || text.includes(keyword)) {
        return icon;
      }
    }
  }

  return defaultIcon;
}

// 读取数据文件
function addItemIcons(dataFilePath) {
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

  // 遍历所有分类和产品
  data.categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.items.forEach(item => {
        if (!item.icon) {
          item.icon = getIconForItem(item.name, item.description);
        }
      });
    });
  });

  // 保存更新后的数据
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ 已更新文件: ${dataFilePath}`);
}

// 处理所有语言版本
const dataDir = path.join(process.cwd(), 'public', 'data');
const files = ['items-zh.json', 'items-ja.json', 'items.json'];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (fs.existsSync(filePath)) {
    addItemIcons(filePath);
  }
});

console.log('\n✨ 所有产品图标已添加！');
