// Supabase Configuration
// All API keys are loaded from environment variables

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not found. Using placeholder values.');
  console.warn('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.');
}

export const supabaseConfig = {
  url: SUPABASE_URL || 'https://placeholder.supabase.co',
  anonKey: SUPABASE_ANON_KEY || 'placeholder-key',
};

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
