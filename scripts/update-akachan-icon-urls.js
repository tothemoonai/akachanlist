import fs from 'fs';
import path from 'path';

// akachan.jp 产品图标 URL 映射
// 按照 category 和子分类组织
const akachanIconUrls = {
  // category01: 孕产妇用品
  'category01': {
    'category01s01': [ // 产前用品
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img01.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img02.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img03.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img04.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img05.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img07.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img08.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img09.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img10.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img11.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img12.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img13.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img14.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s01/img15.gif?20240501',
    ],
    'category01s02': [ // 入院准备用品
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img01.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img02.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img03.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img04.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img05.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img07.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img08.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img09.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s02/img10.gif?20240501',
    ],
    'category01s03': [ // 产后用品
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s03/img02.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s03/img03.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category01/category01s03/img04.gif?20240501',
    ],
  },
  // category02: 婴儿用品（0-3个月）
  'category02': {
    'clothing': [ // 衣物
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img01.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img02.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img04.gif?20240501',
    ],
    'diapers': [ // 纸尿裤相关
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category02/img01.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category02/img02.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category02/img03.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category02/img04.gif?20240501',
    ],
    'feeding': [ // 哺乳用品
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img01.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img02.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img03.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category05/img04.gif?20240501',
    ],
    'bathing': [ // 洗澡用品
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img01.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img02.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img03.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img04.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category07/img05.gif?20240501',
    ],
    'sleeping': [ // 睡眠用品
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img01.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img02.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img03.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category04/img05.gif?20240501',
    ],
  },
  // category03: 婴儿用品（3-6个月）
  'category03': {
    'clothing-3-6m': [ // 衣物
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category03/img06.gif?20240501',
    ],
    'toys': [ // 玩具
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category08/img01.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category08/img02.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category08/img03.gif?20240501',
    ],
  },
  // category04: 外出用品
  'outing': {
    'stroller': [ // 婴儿车
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img01.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img06.gif?20240501',
    ],
    'car-seat': [ // 汽车安全座椅
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img07.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img08.gif?20240501',
    ],
    'baby-carrier': [ // 婴儿背带
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img10.gif?20240501',
      'https://www.akachan.jp/assets/dist_pages/junbilist/img/category06/img11.gif?20240501',
    ],
  },
};

// 子分类到 akachan icon URL 的映射
const subcategoryToIconMap = {
  // maternity-mama 子分类
  'prenatal': 'category01s01',
  'hospital': 'category01s02',
  'postpartum': 'category01s03',

  // baby-0-3m 子分类
  'clothing': 'clothing',
  'diapers': 'diapers',
  'feeding': 'feeding',
  'bathing': 'bathing',
  'sleeping': 'sleeping',

  // baby-3-6m 子分类
  'clothing-3-6m': 'clothing-3-6m',
  'toys': 'toys',

  // outing 子分类
  'stroller': 'stroller',
  'car-seat': 'car-seat',
  'baby-carrier': 'baby-carrier',
};

// 分类到 akachan icon URL 的映射
const categoryToAkachanMap = {
  'maternity-mama': 'category01',
  'baby-0-3m': 'category02',
  'baby-3-6m': 'category03',
  'outing': 'category04',
};

// 为数据添加 akachan 图标 URL
function addAkachanIcons(data) {
  let itemIndex = 0;

  data.categories.forEach(category => {
    const akachanCategory = categoryToAkachanMap[category.id];

    category.subcategories.forEach(subcategory => {
      const akachanSubcategory = subcategoryToIconMap[subcategory.id];
      const iconUrls = akachanIconUrls[akachanCategory]?.[akachanSubcategory] || [];

      subcategory.items.forEach((item, index) => {
        // 如果有对应的图标 URL，使用它；否则使用现有的图标
        if (iconUrls[index]) {
          item.icon = iconUrls[index];
          itemIndex++;
        }
      });
    });
  });

  return data;
}

// 读取并更新数据文件
function updateDataFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const updated = addAkachanIcons(data);
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
  console.log(`✅ 已更新: ${filePath}`);
}

// 处理所有语言版本
const dataDir = path.join(process.cwd(), 'public', 'data');
const files = ['items-zh.json', 'items-ja.json', 'items.json'];

console.log('🔄 开始更新数据文件，添加 akachan.jp 图标 URL...\n');

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (fs.existsSync(filePath)) {
    updateDataFile(filePath);
  }
});

console.log('\n✨ 所有数据文件已更新！');
