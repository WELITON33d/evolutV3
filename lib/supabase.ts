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
export const shouldMock = !isConfigured;

// Create Supabase client with fallback
const url = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const key = isConfigured ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(url, key);
export const isSupabaseConfigured = isConfigured;
