import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wnyrinifinvgagbtlpwb.supabase.co',
  'sb_publishable_LCbzioQaM2XTyJZWDHBTLw_OUEbwM5_'
);

async function testUpdate() {
  console.log('🧪 测试更新单个商品图标...\n');

  // 先查询一个商品
  const { data: item, error: getError } = await supabase
    .from('items')
    .select('id, name_zh, icon')
    .eq('name_zh', '补充剂·食品')
    .single();

  if (getError) {
    console.error('❌ 查询失败:', getError);
    return;
  }

  console.log('当前状态:');
  console.log(`- ${item.name_zh}`);
  console.log(`- 图标: ${item.icon}`);
  console.log(`- ID: ${item.id}\n`);

  // 尝试更新
  console.log('尝试更新图标为 /icons/maternity-mama.png...');
  const { error: updateError } = await supabase
    .from('items')
    .update({ icon: '/icons/maternity-mama.png' })
    .eq('id', item.id);

  if (updateError) {
    console.error('❌ 更新失败:', updateError);
    return;
  }

  console.log('✅ 更新请求成功\n');

  // 重新查询验证
  const { data: updatedItem, error: getError2 } = await supabase
    .from('items')
    .select('id, name_zh, icon')
    .eq('id', item.id)
    .single();

  if (getError2) {
    console.error('❌ 查询失败:', getError2);
    return;
  }

  console.log('更新后状态:');
  console.log(`- ${updatedItem.name_zh}`);
  console.log(`- 图标: ${updatedItem.icon}`);
}

testUpdate();
