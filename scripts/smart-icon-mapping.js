import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// 图标映射规则（基于日文名称关键词）
const iconMappingRules = [
  {
    icon: '/icons/junnyu-cho-nyu.png',
    keywords: ['産後', '入院', '産褥', '授乳', 'マタニティ'],
    description: '入院准备/产后用品'
  },
  {
    icon: '/icons/nenne-oheya.png',
    keywords: ['ベビーベッド', '寝具', '布団', 'スリーパー'],
    description: '睡眠用品'
  },
  {
    icon: '/icons/ofuro-baby-care.png',
    keywords: ['沐浴', '湯', 'おむつ', 'ケア', 'シャンプー'],
    description: '沐浴/护理用品'
  },
  {
    icon: '/icons/omutu-kaeta.png',
    keywords: ['おむつ', 'トイレ'],
    description: '如厕训练/纸尿裤'
  },
  {
    icon: '/icons/odekake.png',
    keywords: ['ベビーカー', 'チャイルドシート', 'スリング', '外出', 'キャリア'],
    description: '外出用品'
  },
  {
    icon: '/icons/baby-wear.png',
    keywords: ['服', '肌着', 'カバーオール', 'よだれかけ', '靴下', '帽子'],
    description: '婴儿服装'
  },
  {
    icon: '/icons/maternity-mama.png',
    keywords: ['妊娠', 'ママ', '母乳', '孕妇'],
    description: '孕产妇用品'
  }
];

// 默认图标
const defaultIcon = '/icons/baby-wear.png';

// 根据关键词匹配图标
function matchIcon(japaneseName) {
  for (const rule of iconMappingRules) {
    for (const keyword of rule.keywords) {
      if (japaneseName.includes(keyword)) {
        return rule.icon;
      }
    }
  }
  return defaultIcon;
}

async function updateIcons() {
  console.log('🔄 开始智能图标映射...\n');

  try {
    // 获取所有商品
    const { data: items, error } = await supabase
      .from('items')
      .select('id, name_zh, name_ja, icon');

    if (error) {
      console.error('❌ 获取商品失败:', error);
      return;
    }

    console.log(`✅ 找到 ${items.length} 个商品\n`);

    const updates = [];

    // 分析每个商品
    for (const item of items) {
      const newIcon = matchIcon(item.name_ja);

      if (item.icon !== newIcon) {
        updates.push({
          id: item.id,
          name_zh: item.name_zh,
          name_ja: item.name_ja,
          oldIcon: item.icon,
          newIcon: newIcon
        });
      }
    }

    console.log(`📊 需要更新 ${updates.length} 个商品的图标\n`);

    // 按图标分组显示
    const byIcon = {};
    updates.forEach(u => {
      if (!byIcon[u.newIcon]) byIcon[u.newIcon] = [];
      byIcon[u.newIcon].push(u);
    });

    for (const [icon, items] of Object.entries(byIcon)) {
      const rule = iconMappingRules.find(r => r.icon === icon);
      console.log(`\n📁 ${icon}`);
      console.log(`   ${rule?.description || '默认图标'}`);
      console.log(`   共 ${items.length} 个商品:`);
      items.slice(0, 5).forEach(i => {
        console.log(`     - ${i.name_zh} (${i.name_ja})`);
      });
      if (items.length > 5) {
        console.log(`     ... 还有 ${items.length - 5} 个`);
      }
    }

    // 执行更新
    console.log(`\n⏳ 开始更新数据库...\n`);

    for (const update of updates) {
      const { error } = await supabase
        .from('items')
        .update({ icon: update.newIcon })
        .eq('id', update.id);

      if (error) {
        console.error(`❌ 更新失败: ${update.name_zh}`, error);
      }
    }

    console.log(`\n🎉 完成！更新了 ${updates.length} 个商品的图标`);

    // 统计最终结果
    const { data: finalItems } = await supabase
      .from('items')
      .select('icon');

    const stats = {};
    finalItems.forEach(item => {
      stats[item.icon] = (stats[item.icon] || 0) + 1;
    });

    console.log(`\n📈 最终统计:`);
    for (const [icon, count] of Object.entries(stats)) {
      const rule = iconMappingRules.find(r => r.icon === icon);
      console.log(`   ${icon}: ${count} 个商品`);
      if (rule) {
        console.log(`     (${rule.description})`);
      }
    }

  } catch (error) {
    console.error('❌ 发生错误:', error);
  }
}

updateIcons();
