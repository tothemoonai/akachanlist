import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client using 2025 publishable key format
// VITE_SUPABASE_ANON_KEY should be a publishable key: sb_publishable_...
// Old anon key format (eyJ...) is deprecated
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;