/**
 * 创建管理员用户
 * 使用Service Role Key绕过RLS创建用户
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 缺少Supabase环境变量');
  process.exit(1);
}

// 使用Service Role Key创建客户端（绕过RLS）
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  console.log('🚀 开始创建管理员用户...\n');

  // 管理员信息
  const adminEmail = 'admin@akachanlist.com';
  const adminPassword = 'Admin@123456';

  try {
    // 创建用户
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // 自动确认邮箱
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log('⚠️  管理员用户已存在');
        console.log('   邮箱:', adminEmail);
        console.log('   如果忘记密码，请在Supabase Dashboard中重置\n');
      } else {
        throw error;
      }
    } else {
      console.log('✅ 管理员用户创建成功！\n');
      console.log('📋 登录信息:');
      console.log('   邮箱:', adminEmail);
      console.log('   密码:', adminPassword);
      console.log('\n🔗 登录页面:');
      console.log('   本地: http://localhost:5180/login');
      console.log('   Preview: https://akachanlist-git-staging-tothemoonais-projects.vercel.app/login');
      console.log('   Production: https://akachanlist.vercel.app/login\n');
    }

    console.log('💡 提示: 首次登录后建议修改密码！\n');
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
    process.exit(1);
  }
}

// 执行创建
createAdminUser();
