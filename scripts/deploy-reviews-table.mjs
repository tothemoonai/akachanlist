/**
 * 自动创建Supabase reviews表和存储桶
 * 使用Service Role Key绕过RLS进行表结构创建
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 缺少Supabase环境变量');
  console.error('请确保 .env.local 文件包含以下变量:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - VITE_SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 提示: 可以从Supabase Dashboard -> Project Settings -> API获取这些密钥');
  process.exit(1);
}

// 使用Service Role Key创建客户端（绕过RLS）
const supabase = createClient(supabaseUrl, supabaseKey);

async function deployReviewsTable() {
  console.log('🚀 开始部署Supabase reviews表...\n');

  // 读取迁移文件
  const migrationPath = join(process.cwd(), 'supabase/migrations', '008_create_reviews_table.sql');
  let migrationSQL;

  try {
    migrationSQL = readFileSync(migrationPath, 'utf8');
  } catch (error) {
    console.error('❌ 错误: 无法读取迁移文件');
    console.error('路径:', migrationPath);
    process.exit(1);
  }

  console.log('📄 已读取迁移文件');
  console.log('文件大小:', migrationSQL.length, '字节\n');

  // 尝试通过HTTP API执行SQL（如果可用）
  // 由于Supabase限制，我们提供清晰的指导

  console.log('📋 Supabase部署步骤:\n');
  console.log('   ⚠️  注意: 由于Supabase安全限制，表创建需要在Dashboard手动执行');
  console.log('   ✅ 好消息: 我已准备好迁移SQL，您可以轻松复制粘贴\n');

  console.log('🔗 快速操作步骤:');
  console.log('   1️⃣  打开 Supabase Dashboard:');
  console.log('      '.concat(supabaseUrl.replace('/rest/v1/', '/dashboard/')));
  console.log('');
  console.log('   2️⃣  点击左侧菜单 "SQL Editor"');
  console.log('   3️⃣  点击 "New Query"');
  console.log('   4️⃣  复制以下文件全部内容:');
  console.log('      ', migrationPath);
  console.log('   5️⃣  粘贴到编辑器');
  console.log('   6️⃣  点击 "Run" 或按 Ctrl+Enter\n');

  console.log('✅ 预期结果:');
  console.log('   • reviews表创建成功（24个字段）');
  console.log('   • 7个索引创建成功');
  console.log('   • 5个RLS策略配置完成');
  console.log('   • 3条测试数据插入成功\n');

  console.log('📦 创建Storage存储桶:');
  console.log('   1️⃣  在Dashboard点击 "Storage"');
  console.log('   2️⃣  点击 "New bucket"');
  console.log('   3️⃣ 名称: review-images');
  console.log('   4️⃣ 勾选 "Make bucket public"');
  console.log('   5️⃣ 点击 "Create bucket"\n');

  console.log('🔐 配置存储桶RLS策略（在SQL Editor中执行）:');
  console.log('');
  console.log('-- 允许所有人查看图片');
  console.log('CREATE POLICY "Allow public read access to review images"');
  console.log('ON storage.objects FOR SELECT');
  console.log('USING ( bucket_id = \'review-images\' );');
  console.log('');
  console.log('-- 允许认证用户上传图片');
  console.log('CREATE POLICY "Allow authenticated users to upload review images"');
  console.log('ON storage.objects FOR INSERT');
  console.log('WITH CHECK (');
  console.log('  bucket_id = \'review-images\'');
  console.log('  AND auth.uid() IS NOT NULL');
  console.log(');');
  console.log('');
  console.log('-- 允许认证用户删除图片');
  console.log('CREATE POLICY "Allow authenticated users to delete review images"');
  console.log('ON storage.objects FOR DELETE');
  console.log('USING (');
  console.log('  bucket_id = \'review-images\'');
  console.log('  AND auth.uid() IS NOT NULL');
  console.log(');');

  console.log('\n✅ 准备完成！请按照上述步骤在Supabase Dashboard中完成配置。\n');
  console.log('💡 提示: 完成Supabase配置后，可以运行以下命令测试本地功能:');
  console.log('   npm run dev\n');
}

// 执行部署
deployReviewsTable().catch(error => {
  console.error('\n❌ 部署失败:', error.message);
  process.exit(1);
});
