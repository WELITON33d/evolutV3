import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if variables are set and not default placeholders
const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

if (!isConfigured) {
  console.warn('Missing or invalid Supabase environment variables. defaulting to Mock Mode.');
}

// Mock mode is active if not configured
export const shouldMock = false;

// Create Supabase client
const url = isConfigured ? supabaseUrl : '';
const key = isConfigured ? supabaseAnonKey : '';

if (!isConfigured) {
  console.error('Supabase not configured. Application will not function correctly.');
}

export const supabase = createClient(url, key);
export const isSupabaseConfigured = isConfigured;
