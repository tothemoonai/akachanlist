/**
 * 执行数据库迁移
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 缺少Supabase环境变量');
  process.exit(1);
}

async function applyMigration() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error('❌ 请指定迁移文件名');
    console.log('用法: node scripts/apply-migration.mjs <migration-file>');
    console.log('示例: node scripts/apply-migration.mjs 009_add_view_count_to_lists.sql');
    process.exit(1);
  }

  const migrationPath = join(process.cwd(), 'supabase/migrations', migrationFile);

  console.log('📄 迁移文件:', migrationPath);
  console.log('');
  console.log('⚠️  请在 Supabase Dashboard 的 SQL Editor 中执行以下内容：\n');

  const sql = readFileSync(migrationPath, 'utf8');
  console.log(sql);
  console.log('');
  console.log('🔗 SQL Editor: https://wnyrinifinvgagbtlpwb.supabase.co/sql');
}

applyMigration();
