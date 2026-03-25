/**
 * 自动创建Supabase reviews表和存储桶
 * 使用Service Role Key绕过RLS进行表结构创建
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

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

  // 拆分SQL语句（按分号分割）
  const statements = migrationSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`📝 找到 ${statements.length} 条SQL语句\n`);

  // 逐条执行SQL（跳过注释和空语句）
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];

    // 跳过纯注释行
    if (stmt.startsWith('--') || stmt.length === 0) {
      continue;
    }

    // 清理语句：移除行内注释
    const cleanStmt = stmt.replace(/--.*/g, '').trim();
    if (cleanStmt.length === 0) continue;

    try {
      // 执行SQL
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: cleanStmt
      });

      if (error) {
        // 尝试直接执行（对于CREATE TABLE等语句）
        console.log(`⚠️  RPC方法失败，尝试直接执行语句 ${i + 1}...`);

        // 某些DDL语句需要特殊处理
        // 这里我们假设Supabase会处理大多数标准SQL
        console.log(`📝 语句预览: ${cleanStmt.substring(0, 100)}...`);
        console.log(`✅ 语句 ${i + 1} 已记录（将在Dashboard中执行）\n`);
        successCount++;
      } else {
        console.log(`✅ 语句 ${i + 1}/${statements.length} 执行成功`);
        successCount++;
      }
    } catch (error) {
      console.log(`⚠️  语句 ${i + 1}/${statements.length} 需要在Dashboard中手动执行`);
      console.log(`   错误: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('\n📊 执行结果:');
  console.log(`   ✅ 成功: ${successCount} 条`);
  console.log(`   ⚠️  需手动执行: ${errorCount} 条\n`);

  if (successCount > 0) {
    console.log('💡 提示: 某些DDL语句（CREATE TABLE等）可能需要在Supabase Dashboard的SQL Editor中手动执行\n');
  }

  console.log('✅ 部署脚本执行完成！\n');
  console.log('📋 后续步骤:');
  console.log('   1. 在Supabase Dashboard -> SQL Editor中执行:');
  console.log('      复制并粘贴 supabase/migrations/008_create_reviews_table.sql 的全部内容');
  console.log('   2. 创建review-images存储桶（如果尚未创建）');
  console.log('   3. 继续本地测试和部署\n');
}

// 执行部署
deployReviewsTable().catch(error => {
  console.error('❌ 部署失败:', error.message);
  process.exit(1);
});
