import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if valid Supabase connection details are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

if (!isSupabaseConfigured) {
  console.info(
    '%c[PlacementPro Supabase Info]%c Running in Interactive Local/Demo Mode. Database calls persist in browser storage and demo credentials are automatically available.',
    'color: #3b82f6; font-weight: bold;',
    'color: inherit;'
  );
}

// Create Supabase client instance (safe fallback even if keys aren't configured yet)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://dummy-instance.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'dummy-anon-key'
);
